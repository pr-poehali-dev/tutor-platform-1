UPDATE marketing_segments SET title='VIP-покупатели', description='Более 2 покупок, средний чек выше среднего' WHERE code='vip';
UPDATE marketing_segments SET title='Постоянные',     description='Покупали 1-2 раза, активны в последние 30 дней'   WHERE code='regulars';
UPDATE marketing_segments SET title='Спящие',         description='Покупали, но не заходили 30+ дней'                 WHERE code='sleeping';
UPDATE marketing_segments SET title='Горячие лиды',   description='Зарегистрировались, но не купили. Активны 7 дней'  WHERE code='hot_lead';
UPDATE marketing_segments SET title='Холодные',       description='Никогда не заходили после регистрации'             WHERE code='cold';
