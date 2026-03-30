from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import HttpResponse, JsonResponse
from django.core.mail import send_mail
from django.db.models import Q
from django.conf import settings
from collections import defaultdict
from reportlab.pdfgen import canvas

from .models import Expense, EmailOTP
from .forms import ExpenseForm, RegisterForm


# ======================================================
# HTML TEMPLATE VIEWS (Old Django UI – Optional)
# ======================================================

@login_required
def home(request):
    expenses = Expense.objects.filter(user=request.user).order_by('-date')

    query = request.GET.get('q')
    if query:
        expenses = expenses.filter(
            Q(title__icontains=query) | Q(category__icontains=query)
        )

    month = request.GET.get('month')
    if month:
        expenses = expenses.filter(date__month=month)

    total = sum(exp.amount for exp in expenses)

    categories = {}
    for expense in expenses:
        categories[expense.category] = categories.get(
            expense.category, 0
        ) + float(expense.amount)

    monthly_data = defaultdict(float)
    for expense in expenses:
        month_label = expense.date.strftime('%b %Y')
        monthly_data[month_label] += float(expense.amount)

    return render(request, 'home.html', {
        'expenses': expenses,
        'total': total,
        'categories': categories,
        'monthly_labels': list(monthly_data.keys()),
        'monthly_values': list(monthly_data.values())
    })


@login_required
def download_pdf(request):
    expenses = Expense.objects.filter(user=request.user)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="expense_report.pdf"'

    p = canvas.Canvas(response)
    y = 800
    p.drawString(200, y, "Expense Report")
    y -= 30

    total = 0

    for expense in expenses:
        line = f"{expense.title} - {expense.category} - ₹{expense.amount} - {expense.date}"
        p.drawString(50, y, line)
        total += float(expense.amount)
        y -= 20

    y -= 20
    p.drawString(50, y, f"Total Expense: ₹{total}")

    p.showPage()
    p.save()

    return response


# ======================================================
# AUTH + OTP
# ======================================================

def register(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False
            user.save()

            otp_obj, created = EmailOTP.objects.get_or_create(user=user)
            otp_obj.generate_otp()

            send_mail(
                'Your OTP Code',
                f'Your OTP is: {otp_obj.otp}',
                None,
                [user.email],
            )

            messages.success(request, "OTP sent to your email.")
            return redirect('verify_otp')
        else:
            messages.error(request, "Please correct the errors below.")
    else:
        form = RegisterForm()

    return render(request, 'register.html', {'form': form})


def verify_otp(request):
    if request.method == 'POST':
        otp_entered = request.POST.get('otp')

        try:
            otp_obj = EmailOTP.objects.latest('created_at')

            if otp_obj.otp == otp_entered:
                user = otp_obj.user
                user.is_active = True
                user.save()
                otp_obj.delete()

                messages.success(request, "Account verified successfully!")
                return redirect('login')
            else:
                messages.error(request, "Invalid OTP")

        except:
            messages.error(request, "OTP expired or invalid")

    return render(request, 'verify_otp.html')



# ======================================================
# REST API — User Registration (React Frontend)
# POST /api/register/
# ======================================================

from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def api_register(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    username = data.get('username', '').strip()
    email    = data.get('email', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return JsonResponse({'error': 'Username and password required'}, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse({'username': ['Username already taken.']}, status=400)

    if email and User.objects.filter(email=email).exists():
        return JsonResponse({'email': ['Email already registered.']}, status=400)

    if len(password) < 8:
        return JsonResponse({'error': 'Password must be at least 8 characters.'}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)
    user.save()

    return JsonResponse({'message': 'Account created successfully.'}, status=201)


# ======================================================
# REST API — Expense CRUD (For React Frontend)
# ======================================================

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .serializers import ExpenseSerializer
from google import genai
from google.genai import types
import json
import os


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ======================================================
# HELPER — Build expense summary for Gemini context
# ======================================================

def build_expense_summary(user):
    expenses = Expense.objects.filter(user=user).order_by('-date')

    if not expenses.exists():
        return None

    total = sum(float(e.amount) for e in expenses)

    # Category breakdown
    cat_totals = {}
    for e in expenses:
        cat_totals[e.category] = cat_totals.get(e.category, 0) + float(e.amount)

    # Monthly breakdown
    monthly = {}
    for e in expenses:
        key = e.date.strftime('%b %Y')
        monthly[key] = monthly.get(key, 0) + float(e.amount)

    # Recent 10 transactions
    recent = []
    for e in expenses[:10]:
        recent.append({
            "description": e.title,
            "amount": float(e.amount),
            "category": e.category,
            "date": str(e.date),
            "payment_method": getattr(e, 'payment_method', ''),
        })

    top_cat = max(cat_totals, key=cat_totals.get) if cat_totals else "N/A"
    top_cat_amt = cat_totals.get(top_cat, 0)

    summary = f"""
User's Expense Data:
- Total spent (all time): ₹{total:,.2f}
- Number of transactions: {expenses.count()}
- Top spending category: {top_cat} (₹{top_cat_amt:,.2f})
- Category breakdown: {json.dumps({k: round(v, 2) for k, v in cat_totals.items()}, indent=2)}
- Monthly breakdown: {json.dumps({k: round(v, 2) for k, v in monthly.items()}, indent=2)}
- Recent transactions: {json.dumps(recent, indent=2)}
"""
    return summary


# ======================================================
# HELPER — Rule-based fallback when Gemini API is unavailable
# ======================================================

def rule_based_answer(user, user_message=None):
    """Answers finance questions directly from DB when Gemini is unavailable."""
    expenses = Expense.objects.filter(user=user).order_by('-date')

    if not expenses.exists():
        return "You haven't added any expenses yet! Start logging your expenses and I'll analyse your spending."

    total = sum(float(e.amount) for e in expenses)
    count = expenses.count()
    avg = total / count if count else 0

    # Build category totals — keyed by lowercase for matching
    cat_totals = {}
    cat_display = {}  # original case for display
    for e in expenses:
        key = e.category.lower()
        cat_totals[key] = cat_totals.get(key, 0) + float(e.amount)
        cat_display[key] = e.category  # keep original display name

    from django.utils import timezone
    now = timezone.now()

    # Use most recent expense month for "this month"
    latest = expenses.first()
    ref_month = latest.date.month if latest else now.month
    ref_year  = latest.date.year  if latest else now.year
    month_expenses = expenses.filter(date__month=ref_month, date__year=ref_year)
    month_total = sum(float(e.amount) for e in month_expenses)
    month_label = latest.date.strftime('%B %Y') if latest else now.strftime('%B %Y')

    top_cat_key = max(cat_totals, key=cat_totals.get) if cat_totals else None
    top_cat_name = cat_display.get(top_cat_key, 'N/A')
    top_cat_amt  = cat_totals.get(top_cat_key, 0)
    sorted_cats  = sorted(cat_totals.items(), key=lambda x: x[1], reverse=True)

    msg = (user_message or '').lower()

    # ── 1. Detect specific category mentioned in the message ──────────────
    matched_cat = None
    # First: exact match against user's actual categories
    for key in cat_totals:
        if key in msg:
            matched_cat = key
            break

    # Second: alias matching
    aliases = {
        'food': ['food', 'eating', 'meal', 'restaurant', 'dining', 'grocery', 'groceries'],
        'travel': ['travel', 'transport', 'uber', 'cab', 'commute', 'fuel', 'petrol'],
        'entertainment': ['entertainment', 'movie', 'netflix', 'streaming', 'fun', 'outing'],
        'gym': ['gym', 'fitness', 'workout', 'exercise'],
        'shopping': ['shopping', 'clothes', 'amazon', 'flipkart', 'purchase'],
        'utilities': ['electricity', 'water', 'internet', 'bill', 'utility', 'utilities'],
        'education': ['education', 'course', 'book', 'school', 'college', 'tuition'],
        'health': ['health', 'medicine', 'doctor', 'hospital', 'pharmacy'],
    }
    if not matched_cat:
        for cat_key, keywords in aliases.items():
            if any(kw in msg for kw in keywords):
                matched_cat = cat_key
                break

    # Answer about specific category
    if matched_cat:
        if matched_cat in cat_totals:
            cat_name = cat_display.get(matched_cat, matched_cat.title())
            cat_amt  = cat_totals[matched_cat]
            pct      = (cat_amt / total * 100) if total else 0
            cat_month_exps = month_expenses.filter(category__iexact=cat_name)
            cat_month_total = sum(float(e.amount) for e in cat_month_exps)
            cat_items = expenses.filter(category__iexact=cat_name)
            lines = [f"🗂️ **{cat_name}** spending:"]
            lines.append(f"• All time: ₹{cat_amt:,.0f} ({pct:.1f}% of total)")
            lines.append(f"• In {month_label}: ₹{cat_month_total:,.0f}")
            lines.append(f"• Transactions: {cat_items.count()}")
            if cat_items.count() > 0:
                lines.append(f"\n📝 Transactions:")
                for e in cat_items[:5]:
                    lines.append(f"  • {e.title} — ₹{float(e.amount):,.0f} on {e.date}")
            return '\n'.join(lines)
        else:
            return f"You have no expenses recorded under **{matched_cat.title()}** yet. Add some and I'll track them! 📝"

    # ── 2. Category breakdown ─────────────────────────────────────────────
    if any(w in msg for w in ['top', 'most', 'highest', 'biggest', 'breakdown', 'categories', 'category']):
        lines = ["📊 Your spending by category:"]
        for key, amt in sorted_cats:
            pct = (amt / total * 100) if total else 0
            lines.append(f"• {cat_display[key]}: ₹{amt:,.0f} ({pct:.1f}%)")
        lines.append(f"\n🏆 Top: **{top_cat_name}** at ₹{top_cat_amt:,.0f}")
        return '\n'.join(lines)

    # ── 3. Total / overall ────────────────────────────────────────────────
    if any(w in msg for w in ['total', 'overall', 'all time', 'everything']):
        return (
            f"💰 Overall spending:\n"
            f"• All time: ₹{total:,.0f}\n"
            f"• {month_label}: ₹{month_total:,.0f}\n"
            f"• Transactions: {count}\n"
            f"• Avg per transaction: ₹{avg:,.0f}"
        )

    # ── 4. This month ─────────────────────────────────────────────────────
    if any(w in msg for w in ['month', 'monthly', 'this month']):
        lines = [f"📅 {month_label}: ₹{month_total:,.0f}"]
        lines.append(f"• Transactions: {month_expenses.count()}")
        month_cats = {}
        for e in month_expenses:
            month_cats[e.category] = month_cats.get(e.category, 0) + float(e.amount)
        if month_cats:
            lines.append("• By category:")
            for cat, amt in sorted(month_cats.items(), key=lambda x: x[1], reverse=True):
                lines.append(f"  - {cat}: ₹{amt:,.0f}")
        return '\n'.join(lines)

    # ── 5. How much / spent (generic) ────────────────────────────────────
    if any(w in msg for w in ['how much', 'spent', 'spend']):
        return (
            f"💰 Spending summary:\n"
            f"• All time: ₹{total:,.0f}\n"
            f"• {month_label}: ₹{month_total:,.0f}\n"
            f"• Transactions: {count}\n\n"
            f"💡 Ask about a specific category: 'how much for food?'"
        )

    # ── 6. Save / tips ────────────────────────────────────────────────────
    if any(w in msg for w in ['save', 'saving', 'reduce', 'cut', 'tip', 'advice', 'suggest', 'budget']):
        return (
            f"💡 Saving tips based on your spending:\n"
            f"• Biggest expense: **{top_cat_name}** (₹{top_cat_amt:,.0f}) — try cutting 10-15%\n"
            f"• Monthly target: ₹{month_total * 0.85:,.0f} (15% less than {month_label})\n"
            f"• Track every spend — small amounts add up fast!\n"
            f"• Goal: save 20% of income monthly 🎯"
        )

    # ── 7. Average ────────────────────────────────────────────────────────
    if any(w in msg for w in ['average', 'avg']):
        return (
            f"📈 Averages:\n"
            f"• Per transaction: ₹{avg:,.0f}\n"
            f"• Total transactions: {count}\n"
            f"• Total spent: ₹{total:,.0f}"
        )

    # ── 8. Recent ─────────────────────────────────────────────────────────
    if any(w in msg for w in ['recent', 'last', 'latest', 'history']):
        lines = ["🕐 5 most recent expenses:"]
        for e in expenses[:5]:
            lines.append(f"• {e.title} — ₹{float(e.amount):,.0f} ({e.category}) on {e.date}")
        return '\n'.join(lines)

    # ── 9. Default snapshot ───────────────────────────────────────────────
    return (
        f"📊 Your snapshot:\n"
        f"• Total: ₹{total:,.0f} ({count} transactions)\n"
        f"• {month_label}: ₹{month_total:,.0f}\n"
        f"• Top category: {top_cat_name} (₹{top_cat_amt:,.0f})\n"
        f"• Avg: ₹{avg:,.0f}/transaction\n\n"
        f"💬 Try: 'food spending', 'entertainment costs', 'saving tips', 'recent expenses'"
    )


# ======================================================
# API VIEW 1 — Auto analysis on dashboard load
# GET /api/gemini-advisor/
# ======================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def gemini_ai_advisor(request):
    summary = build_expense_summary(request.user)

    if not summary:
        return Response({
            "insight": "No expenses found yet. Start adding expenses and I'll analyze your spending patterns!"
        })

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        prompt = f"""
You are a smart personal finance advisor for an Indian user tracking expenses in rupees (₹).

{summary}

Based on this real data, provide a concise analysis with:
1. One sentence summarizing their overall spending
2. The biggest spending concern (mention the actual category and amount)
3. One specific overspending warning if any category seems high
4. One actionable budget suggestion with a specific rupee amount
5. One motivational saving tip

Keep it friendly, specific, and under 120 words. Use bullet points starting with •
Address the user as "you". Use ₹ for amounts. Base EVERYTHING on their actual numbers above — no generic advice.
"""

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        return Response({"insight": response.text.strip()})

    except Exception as e:
        # Fallback: generate insight from real data without Gemini
        fallback = rule_based_answer(request.user, "summary advice")
        return Response({"insight": fallback})


# ======================================================
# API VIEW 2 — Chat: user asks questions
# POST /api/gemini-chat/
# Body: { "message": "Which category am I spending most on?" }
# ======================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def gemini_chat(request):
    user_message = request.data.get("message", "").strip()

    if not user_message:
        return Response({"error": "Message is required."}, status=400)

    summary = build_expense_summary(request.user)

    if not summary:
        return Response({
            "reply": "You haven't added any expenses yet! Start logging your expenses and I'll answer questions about your spending."
        })

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        prompt = f"""
You are a smart, friendly personal finance assistant for an Indian user tracking expenses in rupees (₹).
You have full access to their expense data below.

{summary}

The user asks: "{user_message}"

Answer their question directly using their actual data.
- Be specific — use real numbers from their data
- Keep the reply concise (under 100 words)
- Use ₹ for amounts
- If they ask something unrelated to finances, politely redirect them
- Be conversational and friendly
"""

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        return Response({"reply": response.text.strip()})

    except Exception:
        # Fallback: answer from real expense data without Gemini
        fallback = rule_based_answer(request.user, user_message)
        return Response({"reply": fallback})