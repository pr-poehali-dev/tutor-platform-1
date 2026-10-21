-- Благотворительные фонды и волонтёрские организации, работающие с детскими домами и детьми-сиротами.
-- Просим рассказать о программе «Каждый ребёнок» подопечным учреждениям. Адреса — с официальных сайтов организаций (21.10.2026).
INSERT INTO t_p78828167_tutor_platform_1.edu_campaigns (code, title, subject) VALUES
 ('care_funds_2026', 'Фонды и волонтёры: «Каждый ребёнок»', 'Бесплатное и бессрочное обучение для ваших подопечных детских домов — просим помочь рассказать')
ON CONFLICT (code) DO NOTHING;

INSERT INTO t_p78828167_tutor_platform_1.edu_institutions (org_name, kind, contact_name, phone, email, city, website, status, address, segment, source, note, unsubscribe_token, audience)
SELECT v.n, 'other', '', v.p, v.e, v.c, v.w, 'new', '', v.s, 'Официальный сайт организации, 21.10.2026', 'FUND ' || v.w,
       md5(random()::text || clock_timestamp()::text || v.n), 'fund'
FROM (VALUES
 ('фонда «Арифметика добра»', '', 'info@a-dobra.ru', 'Москва', 'https://a-dobra.ru', 'charity'),
 ('фонда «Измени одну жизнь»', '+7 (499) 277-07-29', 'otvet@changeonelife.ru', 'Москва', 'https://changeonelife.ru', 'charity'),
 ('фонда «Волонтёры в помощь детям-сиротам»', '8 (800) 700-88-05', 'info@otkazniki.ru', 'Москва', 'https://otkazniki.ru', 'charity'),
 ('организации «Детские деревни SOS»', '+7 (495) 718-99-18', 'info@sos-dd.ru', 'Москва', 'https://sos-dd.ru', 'charity'),
 ('программы «Старшие Братья Старшие Сёстры»', '+7 (495) 500-40-43', 'nina.vorontsova@nastavniki.org', 'Москва', 'https://nastavniki.org', 'volunteer'),
 ('фонда «Родительский мост»', '', 'info@rodmost.ru', 'Санкт-Петербург', 'https://rodmost.ru', 'charity'),
 ('фонда «Дорога к дому»', '', 'info@dorogakdomu.ru', 'Москва', 'https://dorogakdomu.ru', 'charity'),
 ('фонда «Обнажённые сердца»', '', 'info@nakedheart.ru', 'Москва', 'https://nakedheart.ru', 'charity'),
 ('центра «Дети Марии»', '', 'mariaschildren@yandex.ru', 'Москва', 'https://mariaschildren.ru', 'charity'),
 ('фонда «Абсолют-Помощь»', '', 'help@absolute-help.ru', 'Москва', 'https://absolute-help.ru', 'charity'),
 ('фонда «Вклад в будущее»', '', 'info@vbudushee.ru', 'Москва', 'https://vbudushee.ru', 'charity'),
 ('платформы «Добро.рф»', '', 'partners@dobro.ru', 'Москва', 'https://dobro.ru', 'volunteer'),
 ('ресурсного центра «Мосволонтёр»', '', 'partner@mosvolonter.ru', 'Москва', 'https://mosvolonter.ru', 'volunteer'),
 ('фонда «Шередарь»', '', 'info@sheredar.ru', 'Москва', 'https://sheredar.ru', 'charity'),
 ('фонда Елены и Геннадия Тимченко', '', 'inform@fondtimchenko.ru', 'Москва', 'https://timchenkofoundation.org', 'charity'),
 ('Благотворительного фонда Владимира Потанина', '', 'altruism@fondpotanin.ru', 'Москва', 'https://fondpotanin.ru', 'charity'),
 ('организации «Мир Детства»', '', 'apostol@mirdetstva.ru', 'Москва', 'https://mirdetstva.ru', 'charity'),
 ('детского фонда «Виктория»', '', 'info@victoriacf.ru', 'Москва', 'https://victoriacf.ru', 'charity'),
 ('фонда «Подсолнух»', '', 'fond@fondpodsolnuh.ru', 'Москва', 'https://fondpodsolnuh.ru', 'charity'),
 ('фонда «Солнце»', '', 'sunfond@sunfond.ru', 'Санкт-Петербург', 'https://sunfund.ru', 'charity'),
 ('службы помощи «Милосердие»', '', 'friends@miloserdie.help', 'Москва', 'https://miloserdie.help', 'charity'),
 ('фонда поддержки детей, находящихся в трудной жизненной ситуации', '', 'info@fond-detyam.ru', 'Москва', 'https://fond-detyam.ru', 'charity')
) AS v(n, p, e, c, w, s)
WHERE NOT EXISTS (SELECT 1 FROM t_p78828167_tutor_platform_1.edu_institutions x WHERE x.audience = 'fund' AND x.note = 'FUND ' || v.w);