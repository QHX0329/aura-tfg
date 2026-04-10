#!/bin/sh
set -eu

python manage.py migrate --noinput
exec celery -A config beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
