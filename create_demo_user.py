import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'expense_tracker.settings')
django.setup()

from django.contrib.auth.models import User

# Remove if exists
User.objects.filter(username='demo').delete()

# Create fresh active user
u = User.objects.create_user('demo', 'demo@test.com', 'Demo@1234')
u.is_active = True
u.save()
print(f'✅ Demo user created: username=demo, password=Demo@1234')
