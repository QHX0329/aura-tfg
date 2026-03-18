"""Migration: elimina optimization_preference, añade weight_price/distance/time."""

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0002_user_notify_new_promos_user_notify_price_alerts_and_more"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="user",
            name="optimization_preference",
        ),
        migrations.AddField(
            model_name="user",
            name="weight_price",
            field=models.PositiveSmallIntegerField(
                default=34,
                help_text="Importancia del precio en la optimización (0-100). Junto a weight_distance y weight_time deben sumar ~100.",
                verbose_name="Peso precio (%)",
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="weight_distance",
            field=models.PositiveSmallIntegerField(
                default=33,
                help_text="Importancia de la distancia en la optimización (0-100).",
                verbose_name="Peso distancia (%)",
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="weight_time",
            field=models.PositiveSmallIntegerField(
                default=33,
                help_text="Importancia del tiempo en la optimización (0-100).",
                verbose_name="Peso tiempo (%)",
            ),
        ),
    ]
