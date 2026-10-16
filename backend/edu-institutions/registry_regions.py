"""Школы регионов вокруг городов пилота (без самих областных центров) из реестра аккредитации Рособрнадзора.
Каждый регион — отдельный модуль, подключается только при загрузке, чтобы не замедлять остальные вызовы."""
SOURCE = 'Реестр аккредитации Рособрнадзора (isga.obrnadzor.gov.ru), 16.10.2026'

SLUGS = ['sverdlovsk', 'novosibirsk', 'tatarstan', 'nizhegorod', 'krasnoyarsk',
         'chelyabinsk', 'bashkortostan', 'krasnodar', 'rostov', 'omsk']


def rows(slug: str) -> list:
    if slug == 'sverdlovsk':
        from regions import r_sverdlovsk as m
    elif slug == 'novosibirsk':
        from regions import r_novosibirsk as m
    elif slug == 'tatarstan':
        from regions import r_tatarstan as m
    elif slug == 'nizhegorod':
        from regions import r_nizhegorod as m
    elif slug == 'krasnoyarsk':
        from regions import r_krasnoyarsk as m
    elif slug == 'chelyabinsk':
        from regions import r_chelyabinsk as m
    elif slug == 'bashkortostan':
        from regions import r_bashkortostan as m
    elif slug == 'krasnodar':
        from regions import r_krasnodar as m
    elif slug == 'rostov':
        from regions import r_rostov as m
    elif slug == 'omsk':
        from regions import r_omsk as m
    else:
        return []
    return m.ROWS
