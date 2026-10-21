-- Региональные благотворительные фонды и отделения Российского детского фонда в 11 регионах пилота «Каждый ребёнок».
-- Адреса — с официальных сайтов организаций (detfond.org/regions и сайты фондов), проверено 21.10.2026.
INSERT INTO t_p78828167_tutor_platform_1.edu_institutions (org_name, kind, contact_name, phone, email, city, website, status, address, segment, source, note, unsubscribe_token, audience)
SELECT v.n, 'other', '', '', v.e, v.c, v.w, 'new', '', 'regional', 'Официальный сайт организации, 21.10.2026', 'FUND ' || v.w,
       md5(random()::text || clock_timestamp()::text || v.n), 'fund'
FROM (VALUES
 ('Свердловского областного отделения Российского детского фонда', 'rdfural@yandex.ru', 'Свердловская область', 'https://detfond.org/regions/sverdlovskoe_oblastnoe_otdelenie/'),
 ('Ростовского регионального отделения Российского детского фонда', 'rostenfond.rnd@gmail.com', 'Ростовская область', 'https://detfond.org/regions/rostovskoe_regionalnoe_otdelenie/'),
 ('Нижегородского областного отделения Российского детского фонда', 'detfondnn@yandex.ru', 'Нижегородская область', 'https://detfond.org/regions/nizhegorodskoe_oblastnoe_otdelenie/'),
 ('Краснодарского регионального отделения Российского детского фонда', 'detfond@mail.ru', 'Краснодарский край', 'https://detfond.org/regions/krasnodarskoe_regionalnoe_otdelenie/'),
 ('Челябинского областного отделения Российского детского фонда', 'rdf74@list.ru', 'Челябинская область', 'https://detfond.org/regions/chelyabinskoe_oblastnoe_otdelenie/'),
 ('Красноярского краевого отделения Российского детского фонда', 'detfond_chekurina@mail.ru', 'Красноярский край', 'https://detfond.org/regions/krasnoyarskoe_kraevoe_otdelenie/'),
 ('Татарстанского республиканского отделения Российского детского фонда', 'salavat.info@mail.ru', 'Республика Татарстан', 'https://detfond.org/regions/tatarstanskoe_respublikanskoe_otdelenie/'),
 ('Башкирского республиканского отделения Российского детского фонда', 'bashdetfond@mail.ru', 'Республика Башкортостан', 'https://detfond.org/regions/bashkirskoe_respublikanskoe_otdelenie/'),
 ('Самарского областного отделения Российского детского фонда', 'samara.rdf@yandex.ru', 'Самарская область', 'https://detfond.org/regions/samarskoe_oblastnoe_otdelenie/'),
 ('Омского областного отделения Российского детского фонда', 'rdf.00@mail.ru', 'Омская область', 'https://detfond.org/regions/omskoe_oblastnoe_otdelenie/'),
 ('Новосибирского регионального отделения Российского детского фонда', 'info@detfond-nso.org', 'Новосибирская область', 'https://detfond.org/regions/novosibirskoe_regionalnoe_otdelenie/'),
 ('АНО «Семья детям»', 'info@family2children.ru', 'Свердловская область', 'https://family2children.ru'),
 ('фонда «Счастливое детство»', 'happychildhood@e1.ru', 'Свердловская область', 'https://fond-rebenok.ru'),
 ('фонда «Солнечный город»', 'sun@sgdeti.ru', 'Новосибирская область', 'https://sgdeti.ru'),
 ('организации «Детям» Республики Татарстан', 'detyam116@mail.ru', 'Республика Татарстан', 'https://детям116.рф'),
 ('проекта «Дети будущего РТ»', 'deti-rt.rf@yandex.ru', 'Республика Татарстан', 'https://дети-будущего-рт.рф'),
 ('фонда «Радость детства»', 'fund-rd@mail.ru', 'Республика Татарстан', 'https://fond-rd.ru'),
 ('проекта «Добрая Казань»', 'dobro@kzn.ru', 'Республика Татарстан', 'https://dobro.kzn.ru'),
 ('фонда «Счастливые дети»', 's-deti2014@mail.ru', 'Красноярский край', 'https://happydeti24.ru'),
 ('фонда «Жёлтый аист»', 'krasbezsirot@mail.ru', 'Красноярский край', 'https://krasbezsirot.ru'),
 ('фонда «Край добра»', 'info@kray-dobra.ru', 'Краснодарский край', 'https://kray-dobra.ru'),
 ('фонда «Радуга»', 'info@raduga-omsk.ru', 'Омская область', 'https://raduga-omsk.ru')
) AS v(n, e, c, w)
WHERE NOT EXISTS (SELECT 1 FROM t_p78828167_tutor_platform_1.edu_institutions x WHERE x.audience = 'fund' AND (x.note = 'FUND ' || v.w OR lower(x.email) = lower(v.e)));