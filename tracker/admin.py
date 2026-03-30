from django.contrib import admin
from .models import Expense, EmailOTP

admin.site.register(Expense)
admin.site.register(EmailOTP)