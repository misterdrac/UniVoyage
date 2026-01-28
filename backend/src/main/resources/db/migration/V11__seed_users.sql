
-- Seed users (USER / ADMIN / HEAD_ADMIN)

INSERT INTO users (
    email,
    password_hash,
    name,
    surname,
    role,
    country_of_origin_code,
    date_of_register,
    date_of_last_signin
) VALUES

-- ===== USERs & LEGENDS =====
('drakulamuhahah@univoyage.com', '$2a$15$FcfpOQ5M06/I9/ZFI7vnqOUCfNB/7q/lPDaVLCcnusr57yhsFaeUy', 'Drakula', 'Muhahah', 'USER', 'RO', NOW(), NOW()),
('drugtito@univoyage.com', '$2a$15$YQtUeC9sRIzciyHBBe3o1.vs0.UoHUuhEr.jerTK8tkChi7CTDWNS', 'Drug', 'Tito', 'USER', 'HR', NOW(), NOW()),
('josipbulicvlaj@univoyage.com', '$2a$15$beg0hbgqJExwdjThUyMha.b.uF9PTQ9LOsceRt/3Nlecokv/XkvjS', 'Josip Bulić', 'Vlaj', 'USER', 'HR', NOW(), NOW()),
('nadbiskupjurdana@univoyage.com', '$2a$15$4xs8jybS2GnvlFlQjGaUyecStuoXAVfT6o5i9dpC7HUIJqlDQZ3PW', 'Nadbiskup', 'Jurdana', 'ADMIN', 'HR', NOW(), NOW()),
('papavolaric@univoyage.com', '$2a$15$QrPnryz1xT6s.A2eiA4opurOroBQtk5/Si8dLsWeRbQVbxorvFsJa', 'Papa', 'Volarić', 'HEAD_ADMIN', 'HR', NOW(), NOW()),
('dobarrucak@univoyage.com', '$2a$15$aL6qdbZ80JhJub.ykdZ3yeUhh6fxzI2BNn0okbaKd4FWoQlrgwMkm', 'Dobar', 'Ručak', 'USER', 'HR', NOW(), NOW()),
('nisamshvatiosintaksuasemblera@univoyage.com', '$2a$15$69560zAH4RUEi0GUlH.j6OzSfSfwMXsW2YL8Sb8ehZjP.aq54fuTa', 'Nisam Shvatio', 'Sintaksu Asemblera', 'USER', 'HR', NOW(), NOW()),
('kakobaze2@univoyage.com', '$2a$15$2fWkFG0aLE.8Qv7tK7.kD.3/a2KD99LxP5FhkARXAXT.GYgEOcOOC', 'Kako', 'Baze 2', 'USER', 'SR', NOW(), NOW()),
('tetalovorka@univoyage.com', '$2a$15$AtU0DNeIJfJuuooB7Dt/j.N.FAN3lkkDO5tBylFKvVEDHPGaqTg2q', 'Teta', 'Lovorka', 'ADMIN', 'HR', NOW(), NOW()),
('tetaizmenze1@univoyage.com', '$2a$15$2uHsKh2kdHO2ZBkCpdIzqOhQIqWjwE56gWg8qc2FcEn8z7FpPCr96', 'Teta Iz Menze', '1', 'USER', 'HR', NOW(), NOW()),
('tetaizmenze2@univoyage.com', '$2a$15$xp8AM4kM7LJxsxT6D04svOR9Vm5gqBjH3xVwXO7/dXpFJP3Xl3CNW', 'Teta Iz Menze', '2', 'USER', 'HR', NOW(), NOW()),
('tomicevstari@univoyage.com', '$2a$15$yHHB/aeX7YFeTJOgH7RN/eo6zf/SWEoWaLAbmuAJfVn8ArEDy2z4u', 'Tomićev', 'Stari', 'USER', 'HR', NOW(), NOW()),
('ivogolubovic@univoyage.com', '$2a$15$VCeAa1vtTy1qTstRyhEweuvsO7KjZpimgIOVHuxIcdPyOlx5Vny9O', 'Ivo', 'Golubović', 'USER', 'HR', NOW(), NOW()),
('stevopecarnik@univoyage.com', '$2a$15$/YaBa3CieznvK/YxHqabHuL5p5NrslIaWyqBT7gBr7fe1s8gX1bcW', 'Stevo', 'Pečarnik', 'USER', 'HR', NOW(), NOW()),
('milutinkeseberovic@univoyage.com', '$2a$15$EviFWqLQWFZY5WWfIKGXeu3dGg3/r3veT0gxd.Q9cgMz3.mfK4gbu', 'Milutin', 'Keseberović', 'USER', 'HR', NOW(), NOW()),
('zelimirjovic@univoyage.com', '$2a$15$P4ojUWswuNFs1iXMF5tYGOf4cBq3MwOQaW3o0ptI/IPks/0Hi5bxy', 'Želimir', 'Jović', 'USER', 'HR', NOW(), NOW()),
('zivkojelcic@univoyage.com', '$2a$15$MTAmaeAvBWf2lcBSYgmyruU4OM7cjXo/2a2dMlZhrCT/xFNSx1FAK', 'Živko', 'Jelčić', 'USER', 'HR', NOW(), NOW()),
('ohnepanjjetu@univoyage.com', '$2a$15$CEafqICqQYMAu8O1sn6sbOGiy9.fms7k0NfPvNheAKzWQBL0isXya', 'OH NE!', 'Panj je tu', 'USER', 'HR', NOW(), NOW()),
('kakobaze12@univoyage.com', '$2a$15$xoCFxg7PKxTP2rT7mFsd1uuULhfYMEiFjbGNt6uuCx90UjGCWXoPW', 'Kako', 'Baze?', 'USER', 'SR', NOW(), NOW()),
('mentol@univoyage.com', '$2a$15$ccZiYGmz7HiDDNe3sEq1v.kvmT1rOTu3MlQ3fjpIkbaKoOKoyRoby', 'Mentol', 'Enjoyer', 'USER', 'HR', NOW(), NOW()),
('vojislavseselj@velikasrbija.rs', '$2a$15$qsVH3UMOdbDixnrkpj3NgOLk.fPyRKt5T4VwC9cWcGYRESBR47Lnq', 'Vojislav Vojo', 'Šešelj', 'USER', 'HR', NOW(), NOW()),

-- ===== ADMINs =====
('dominikvicevic@univoyage.com', '$2a$15$bzFXjXykUOby6WIL75y7lOIYbsicBVNo.6kWDXKBaPTv4GaQwuaaC', 'Dominik', 'Vičević', 'ADMIN', 'HR', NOW(), NOW()),
('erikotovic@univoyage.com', '$2a$15$PuaVy.4j.7yL60IKxe.Fu.pzCqS7FZHk.JoknfTiQsMfMiOwhx3Lu', 'Erik', 'Otović', 'ADMIN', 'HR', NOW(), NOW()),
('sturmbannfuhrer@univoyage.com', '$2a$15$Z0zzsMN8Xz0UQ4mgDVSof.wCvR3dj6aiEibejqUg2Vr17E7xidUb2', 'StürmbannFührer', 'D.J.', 'ADMIN', 'HR', NOW(), NOW()),
('ivaipsic@univoyage.com', '$2a$15$k59NaFl33iUmj7p/rwpnouIrAIRTSuWS7jHAHVXcffFi4oSn6sF3K', 'IVO', 'IPŠIČČ', 'ADMIN', 'HR', '1666-09-02 17:47:48', NOW()),
('nvic@urs.com', '$2a$15$anVwebfXsLq4C/2d5hel0uXxTyGy1e181.w6H2jZ52GsHNCzmxSCO', 'NVIC', 'Registar', 'ADMIN', 'HR', NOW(), NOW()),

-- ===== HEAD_ADMINs =====
('mladentomic@najboljiucitelj.urs.com', '$2a$15$y4h8gUx7UNu6MOzE3Dxk/OYedBNH/NHlXqAIMWqtGezpgA9rKT9dq', 'Mladen', 'Tomić', 'HEAD_ADMIN', 'HR', '1939-09-01 03:47:48', NOW()),
('niko.crvelin@univoyage.com', '$2a$15$hBjkzpbQKckIOJX1yQnXKOts4SAuyrXEM6W0Z1JfYZPWWRQAevAhe', 'Niko', 'Crvelin', 'HEAD_ADMIN', 'HR', NOW(), NOW()),
('dario.golubovic@univoyage.com', '$2a$15$zrxWh3CpsbJmb7lOmHb6LerDd3/w0c3enc4p1EncK37Vmif/tyCsK', 'LIK', 'koji je ovo radio', 'HEAD_ADMIN', 'DE', NOW(), NOW()),
('mrs.napravnik@uniri.hr', '$2a$15$ZVdqct0fJBZfiGW5INptTeZwtauHo.nysiczgsvoEvQ4Qko6qg3Q6', 'Mateica', 'iz Rwa', 'HEAD_ADMIN', 'IT', NOW(), NOW()),
('leonard.lecic@univoyage.com', '$2a$15$dOPlRPE1RwM3SOK6rSXOSe4fCg3EwwMkO1YBV66v0ik8dGbVj4VAa', 'Leca', 'Lecić', 'HEAD_ADMIN', 'RU', NOW(), NOW()),
('bata.batic@uniri.hr', '$2a$15$AJmw86PCI/M32JYXzKdbO.fJkU3MuV5DgXgPguNu8yZ3RPtxeOMxe', 'Bata', 'Batić', 'HEAD_ADMIN', 'CN', NOW(), NOW());