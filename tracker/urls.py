from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExpenseViewSet, home, register, verify_otp, download_pdf, api_register
from . import views

router = DefaultRouter()
router.register(r'expenses', ExpenseViewSet, basename='expenses')

urlpatterns = [
    # HTML routes
    path('', home, name='home'),
    path('register/', register, name='register'),
    path('verify-otp/', verify_otp, name='verify_otp'),
    path('download/', download_pdf, name='download_pdf'),

    # API routes
    path('api/', include(router.urls)),
    path('api/register/', api_register, name='api_register'),     # ← React registration
    path('api/gemini-advisor/', views.gemini_ai_advisor, name='gemini_advisor'),
    path('api/gemini-chat/', views.gemini_chat, name='gemini_chat'),
]