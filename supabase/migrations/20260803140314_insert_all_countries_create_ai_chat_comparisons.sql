/*
# Insert all world countries and create new tables

Uses ON CONFLICT (iso2) since countries table already has a unique constraint on iso2.
Also extends clinics and profiles, creates ai_chat_messages and radiology_comparisons tables.
*/
INSERT INTO countries (name, iso2, iso3, dial_code, currency_code, currency_symbol, currency_name, default_language, region) VALUES
('Egypt', 'EG', 'EGY', '+20', 'EGP', 'E£', 'Egyptian Pound', 'ar', 'Africa'),
('Algeria', 'DZ', 'DZA', '+213', 'DZD', 'DA', 'Algerian Dinar', 'ar', 'Africa'),
('Angola', 'AO', 'AGO', '+244', 'AOA', 'Kz', 'Angolan Kwanza', 'pt', 'Africa'),
('Benin', 'BJ', 'BEN', '+229', 'XOF', 'CFA', 'West African CFA Franc', 'fr', 'Africa'),
('Botswana', 'BW', 'BWA', '+267', 'BWP', 'P', 'Botswana Pula', 'en', 'Africa'),
('Burkina Faso', 'BF', 'BFA', '+226', 'XOF', 'CFA', 'West African CFA Franc', 'fr', 'Africa'),
('Burundi', 'BI', 'BDI', '+257', 'BIF', 'FBu', 'Burundian Franc', 'fr', 'Africa'),
('Cabo Verde', 'CV', 'CPV', '+238', 'CVE', '$', 'Cape Verdean Escudo', 'pt', 'Africa'),
('Cameroon', 'CM', 'CMR', '+237', 'XAF', 'FCFA', 'Central African CFA Franc', 'fr', 'Africa'),
('Central African Republic', 'CF', 'CAF', '+236', 'XAF', 'FCFA', 'Central African CFA Franc', 'fr', 'Africa'),
('Chad', 'TD', 'TCD', '+235', 'XAF', 'FCFA', 'Central African CFA Franc', 'fr', 'Africa'),
('Comoros', 'KM', 'COM', '+269', 'KMF', 'CF', 'Comorian Franc', 'ar', 'Africa'),
('Congo (Brazzaville)', 'CG', 'COG', '+242', 'XAF', 'FCFA', 'Central African CFA Franc', 'fr', 'Africa'),
('Congo (Kinshasa)', 'CD', 'COD', '+243', 'CDF', 'FC', 'Congolese Franc', 'fr', 'Africa'),
('Cote d''Ivoire', 'CI', 'CIV', '+225', 'XOF', 'CFA', 'West African CFA Franc', 'fr', 'Africa'),
('Djibouti', 'DJ', 'DJI', '+253', 'DJF', 'Fdj', 'Djiboutian Franc', 'ar', 'Africa'),
('Eritrea', 'ER', 'ERI', '+291', 'ERN', 'Nfk', 'Eritrean Nakfa', 'en', 'Africa'),
('Eswatini', 'SZ', 'SWZ', '+268', 'SZL', 'E', 'Swazi Lilangeni', 'en', 'Africa'),
('Ethiopia', 'ET', 'ETH', '+251', 'ETB', 'Br', 'Ethiopian Birr', 'en', 'Africa'),
('Gabon', 'GA', 'GAB', '+241', 'XAF', 'FCFA', 'Central African CFA Franc', 'fr', 'Africa'),
('Gambia', 'GM', 'GMB', '+220', 'GMD', 'D', 'Gambian Dalasi', 'en', 'Africa'),
('Ghana', 'GH', 'GHA', '+233', 'GHS', '₵', 'Ghanaian Cedi', 'en', 'Africa'),
('Guinea', 'GN', 'GIN', '+224', 'GNF', 'FG', 'Guinean Franc', 'fr', 'Africa'),
('Guinea-Bissau', 'GW', 'GNB', '+245', 'XOF', 'CFA', 'West African CFA Franc', 'pt', 'Africa'),
('Kenya', 'KE', 'KEN', '+254', 'KES', 'KSh', 'Kenyan Shilling', 'en', 'Africa'),
('Lesotho', 'LS', 'LSO', '+266', 'LSL', 'L', 'Lesotho Loti', 'en', 'Africa'),
('Liberia', 'LR', 'LBR', '+231', 'LRD', 'L$', 'Liberian Dollar', 'en', 'Africa'),
('Libya', 'LY', 'LBY', '+218', 'LYD', 'LD', 'Libyan Dinar', 'ar', 'Africa'),
('Madagascar', 'MG', 'MDG', '+261', 'MGA', 'Ar', 'Malagasy Ariary', 'fr', 'Africa'),
('Malawi', 'MW', 'MWI', '+265', 'MWK', 'MK', 'Malawian Kwacha', 'en', 'Africa'),
('Mali', 'ML', 'MLI', '+223', 'XOF', 'CFA', 'West African CFA Franc', 'fr', 'Africa'),
('Mauritania', 'MR', 'MRT', '+222', 'MRU', 'UM', 'Mauritanian Ouguiya', 'ar', 'Africa'),
('Mauritius', 'MU', 'MUS', '+230', 'MUR', 'Rs', 'Mauritian Rupee', 'en', 'Africa'),
('Morocco', 'MA', 'MAR', '+212', 'MAD', 'DH', 'Moroccan Dirham', 'ar', 'Africa'),
('Mozambique', 'MZ', 'MOZ', '+258', 'MZN', 'MT', 'Mozambican Metical', 'pt', 'Africa'),
('Namibia', 'NA', 'NAM', '+264', 'NAD', 'N$', 'Namibian Dollar', 'en', 'Africa'),
('Niger', 'NE', 'NER', '+227', 'XOF', 'CFA', 'West African CFA Franc', 'fr', 'Africa'),
('Nigeria', 'NG', 'NGA', '+234', 'NGN', '₦', 'Nigerian Naira', 'en', 'Africa'),
('Rwanda', 'RW', 'RWA', '+250', 'RWF', 'RF', 'Rwandan Franc', 'en', 'Africa'),
('Sao Tome and Principe', 'ST', 'STP', '+239', 'STN', 'Db', 'Sao Tome Dobra', 'pt', 'Africa'),
('Senegal', 'SN', 'SEN', '+221', 'XOF', 'CFA', 'West African CFA Franc', 'fr', 'Africa'),
('Seychelles', 'SC', 'SYC', '+248', 'SCR', 'SR', 'Seychellois Rupee', 'en', 'Africa'),
('Sierra Leone', 'SL', 'SLE', '+232', 'SLL', 'Le', 'Sierra Leonean Leone', 'en', 'Africa'),
('Somalia', 'SO', 'SOM', '+252', 'SOS', 'Sh', 'Somali Shilling', 'so', 'Africa'),
('South Africa', 'ZA', 'ZAF', '+27', 'ZAR', 'R', 'South African Rand', 'en', 'Africa'),
('South Sudan', 'SS', 'SSD', '+211', 'SSP', '£', 'South Sudanese Pound', 'en', 'Africa'),
('Sudan', 'SD', 'SDN', '+249', 'SDG', '£', 'Sudanese Pound', 'ar', 'Africa'),
('Tanzania', 'TZ', 'TZA', '+255', 'TZS', 'TSh', 'Tanzanian Shilling', 'en', 'Africa'),
('Togo', 'TG', 'TGO', '+228', 'XOF', 'CFA', 'West African CFA Franc', 'fr', 'Africa'),
('Tunisia', 'TN', 'TUN', '+216', 'TND', 'DT', 'Tunisian Dinar', 'ar', 'Africa'),
('Uganda', 'UG', 'UGA', '+256', 'UGX', 'USh', 'Ugandan Shilling', 'en', 'Africa'),
('Zambia', 'ZM', 'ZMB', '+260', 'ZMW', 'K', 'Zambian Kwacha', 'en', 'Africa'),
('Zimbabwe', 'ZW', 'ZWE', '+263', 'ZWL', 'Z$', 'Zimbabwean Dollar', 'en', 'Africa'),
('Afghanistan', 'AF', 'AFG', '+93', 'AFN', '؋', 'Afghan Afghani', 'en', 'Asia'),
('Armenia', 'AM', 'ARM', '+374', 'AMD', '֏', 'Armenian Dram', 'en', 'Asia'),
('Azerbaijan', 'AZ', 'AZE', '+994', 'AZN', '₼', 'Azerbaijani Manat', 'en', 'Asia'),
('Bahrain', 'BH', 'BHR', '+973', 'BHD', 'BD', 'Bahraini Dinar', 'ar', 'Asia'),
('Bangladesh', 'BD', 'BGD', '+880', 'BDT', '৳', 'Bangladeshi Taka', 'en', 'Asia'),
('Bhutan', 'BT', 'BTN', '+975', 'BTN', 'Nu', 'Bhutanese Ngultrum', 'en', 'Asia'),
('Brunei', 'BN', 'BRN', '+673', 'BND', 'B$', 'Brunei Dollar', 'en', 'Asia'),
('Cambodia', 'KH', 'KHM', '+855', 'KHR', '៛', 'Cambodian Riel', 'en', 'Asia'),
('China', 'CN', 'CHN', '+86', 'CNY', '¥', 'Chinese Yuan', 'zh', 'Asia'),
('Cyprus', 'CY', 'CYP', '+357', 'EUR', '€', 'Euro', 'en', 'Asia'),
('Georgia', 'GE', 'GEO', '+995', 'GEL', '₾', 'Georgian Lari', 'en', 'Asia'),
('India', 'IN', 'IND', '+91', 'INR', '₹', 'Indian Rupee', 'en', 'Asia'),
('Indonesia', 'ID', 'IDN', '+62', 'IDR', 'Rp', 'Indonesian Rupiah', 'en', 'Asia'),
('Iran', 'IR', 'IRN', '+98', 'IRR', '﷼', 'Iranian Rial', 'fa', 'Asia'),
('Iraq', 'IQ', 'IRQ', '+964', 'IQD', 'ع.د', 'Iraqi Dinar', 'ar', 'Asia'),
('Israel', 'IL', 'ISR', '+972', 'ILS', '₪', 'Israeli Shekel', 'en', 'Asia'),
('Japan', 'JP', 'JPN', '+81', 'JPY', '¥', 'Japanese Yen', 'ja', 'Asia'),
('Jordan', 'JO', 'JOR', '+962', 'JOD', 'JD', 'Jordanian Dinar', 'ar', 'Asia'),
('Kazakhstan', 'KZ', 'KAZ', '+7', 'KZT', '₸', 'Kazakhstani Tenge', 'en', 'Asia'),
('Kuwait', 'KW', 'KWT', '+965', 'KWD', 'KD', 'Kuwaiti Dinar', 'ar', 'Asia'),
('Kyrgyzstan', 'KG', 'KGZ', '+996', 'KGS', 'с', 'Kyrgyzstani Som', 'en', 'Asia'),
('Laos', 'LA', 'LAO', '+856', 'LAK', '₭', 'Lao Kip', 'en', 'Asia'),
('Lebanon', 'LB', 'LBN', '+961', 'LBP', 'ل.ل', 'Lebanese Pound', 'ar', 'Asia'),
('Malaysia', 'MY', 'MYS', '+60', 'MYR', 'RM', 'Malaysian Ringgit', 'en', 'Asia'),
('Maldives', 'MV', 'MDV', '+960', 'MVR', 'Rf', 'Maldivian Rufiyaa', 'en', 'Asia'),
('Mongolia', 'MN', 'MNG', '+976', 'MNT', '₮', 'Mongolian Tugrik', 'en', 'Asia'),
('Myanmar', 'MM', 'MMR', '+95', 'MMK', 'K', 'Myanmar Kyat', 'en', 'Asia'),
('Nepal', 'NP', 'NPL', '+977', 'NPR', 'Rs', 'Nepalese Rupee', 'en', 'Asia'),
('North Korea', 'KP', 'PRK', '+850', 'KPW', '₩', 'North Korean Won', 'en', 'Asia'),
('Oman', 'OM', 'OMN', '+968', 'OMR', 'ر.ع', 'Omani Rial', 'ar', 'Asia'),
('Pakistan', 'PK', 'PAK', '+92', 'PKR', 'Rs', 'Pakistani Rupee', 'en', 'Asia'),
('Palestine', 'PS', 'PSE', '+970', 'ILS', '₪', 'Israeli Shekel', 'ar', 'Asia'),
('Philippines', 'PH', 'PHL', '+63', 'PHP', '₱', 'Philippine Peso', 'en', 'Asia'),
('Qatar', 'QA', 'QAT', '+974', 'QAR', 'QR', 'Qatari Riyal', 'ar', 'Asia'),
('Saudi Arabia', 'SA', 'SAU', '+966', 'SAR', 'SR', 'Saudi Riyal', 'ar', 'Asia'),
('Singapore', 'SG', 'SGP', '+65', 'SGD', 'S$', 'Singapore Dollar', 'en', 'Asia'),
('South Korea', 'KR', 'KOR', '+82', 'KRW', '₩', 'South Korean Won', 'en', 'Asia'),
('Sri Lanka', 'LK', 'LKA', '+94', 'LKR', 'Rs', 'Sri Lankan Rupee', 'en', 'Asia'),
('Syria', 'SY', 'SYR', '+963', 'SYP', '£', 'Syrian Pound', 'ar', 'Asia'),
('Taiwan', 'TW', 'TWN', '+886', 'TWD', 'NT$', 'Taiwan Dollar', 'en', 'Asia'),
('Tajikistan', 'TJ', 'TJK', '+992', 'TJS', 'SM', 'Tajikistani Somoni', 'en', 'Asia'),
('Thailand', 'TH', 'THA', '+66', 'THB', '฿', 'Thai Baht', 'en', 'Asia'),
('Timor-Leste', 'TL', 'TLS', '+670', 'USD', '$', 'US Dollar', 'en', 'Asia'),
('Turkey', 'TR', 'TUR', '+90', 'TRY', '₺', 'Turkish Lira', 'tr', 'Asia'),
('Turkmenistan', 'TM', 'TKM', '+993', 'TMT', 'm', 'Turkmenistani Manat', 'en', 'Asia'),
('United Arab Emirates', 'AE', 'ARE', '+971', 'AED', 'AED', 'UAE Dirham', 'ar', 'Asia'),
('Uzbekistan', 'UZ', 'UZB', '+998', 'UZS', 'so''m', 'Uzbekistani Som', 'en', 'Asia'),
('Vietnam', 'VN', 'VNM', '+84', 'VND', '₫', 'Vietnamese Dong', 'en', 'Asia'),
('Yemen', 'YE', 'YEM', '+967', 'YER', '﷼', 'Yemeni Rial', 'ar', 'Asia'),
('Albania', 'AL', 'ALB', '+355', 'ALL', 'L', 'Albanian Lek', 'en', 'Europe'),
('Andorra', 'AD', 'AND', '+376', 'EUR', '€', 'Euro', 'en', 'Europe'),
('Austria', 'AT', 'AUT', '+43', 'EUR', '€', 'Euro', 'en', 'Europe'),
('Belarus', 'BY', 'BLR', '+375', 'BYN', 'Br', 'Belarusian Ruble', 'en', 'Europe'),
('Belgium', 'BE', 'BEL', '+32', 'EUR', '€', 'Euro', 'en', 'Europe'),
('Bosnia and Herzegovina', 'BA', 'BIH', '+387', 'BAM', 'KM', 'Bosnian Mark', 'en', 'Europe'),
('Bulgaria', 'BG', 'BGR', '+359', 'BGN', 'лв', 'Bulgarian Lev', 'en', 'Europe'),
('Croatia', 'HR', 'HRV', '+385', 'EUR', '€', 'Euro', 'en', 'Europe'),
('Czech Republic', 'CZ', 'CZE', '+420', 'CZK', 'Kč', 'Czech Koruna', 'en', 'Europe'),
('Denmark', 'DK', 'DNK', '+45', 'DKK', 'kr', 'Danish Krone', 'en', 'Europe'),
('Estonia', 'EE', 'EST', '+372', 'EUR', '€', 'Euro', 'en', 'Europe'),
('Finland', 'FI', 'FIN', '+358', 'EUR', '€', 'Euro', 'en', 'Europe'),
('France', 'FR', 'FRA', '+33', 'EUR', '€', 'Euro', 'fr', 'Europe'),
('Germany', 'DE', 'DEU', '+49', 'EUR', '€', 'Euro', 'de', 'Europe'),
('Greece', 'GR', 'GRC', '+30', 'EUR', '€', 'Euro', 'en', 'Europe'),
('Hungary', 'HU', 'HUN', '+36', 'HUF', 'Ft', 'Hungarian Forint', 'en', 'Europe'),
('Iceland', 'IS', 'ISL', '+354', 'ISK', 'kr', 'Icelandic Krona', 'en', 'Europe'),
('Ireland', 'IE', 'IRL', '+353', 'EUR', '€', 'Euro', 'en', 'Europe'),
('Italy', 'IT', 'ITA', '+39', 'EUR', '€', 'Euro', 'it', 'Europe'),
('Kosovo', 'XK', 'XKX', '+383', 'EUR', '€', 'Euro', 'en', 'Europe'),
('Latvia', 'LV', 'LVA', '+371', 'EUR', '€', 'Euro', 'en', 'Europe'),
('Liechtenstein', 'LI', 'LIE', '+423', 'CHF', 'CHF', 'Swiss Franc', 'en', 'Europe'),
('Lithuania', 'LT', 'LTU', '+370', 'EUR', '€', 'Euro', 'en', 'Europe'),
('Luxembourg', 'LU', 'LUX', '+352', 'EUR', '€', 'Euro', 'en', 'Europe'),
('Malta', 'MT', 'MLT', '+356', 'EUR', '€', 'Euro', 'en', 'Europe'),
('Moldova', 'MD', 'MDA', '+373', 'MDL', 'L', 'Moldovan Leu', 'en', 'Europe'),
('Monaco', 'MC', 'MCO', '+377', 'EUR', '€', 'Euro', 'en', 'Europe'),
('Montenegro', 'ME', 'MNE', '+382', 'EUR', '€', 'Euro', 'en', 'Europe'),
('Netherlands', 'NL', 'NLD', '+31', 'EUR', '€', 'Euro', 'en', 'Europe'),
('North Macedonia', 'MK', 'MKD', '+389', 'MKD', 'ден', 'Macedonian Denar', 'en', 'Europe'),
('Norway', 'NO', 'NOR', '+47', 'NOK', 'kr', 'Norwegian Krone', 'en', 'Europe'),
('Poland', 'PL', 'POL', '+48', 'PLN', 'zł', 'Polish Zloty', 'en', 'Europe'),
('Portugal', 'PT', 'PRT', '+351', 'EUR', '€', 'Euro', 'pt', 'Europe'),
('Romania', 'RO', 'ROU', '+40', 'RON', 'lei', 'Romanian Leu', 'en', 'Europe'),
('Russia', 'RU', 'RUS', '+7', 'RUB', '₽', 'Russian Ruble', 'en', 'Europe'),
('San Marino', 'SM', 'SMR', '+378', 'EUR', '€', 'Euro', 'en', 'Europe'),
('Serbia', 'RS', 'SRB', '+381', 'RSD', 'дин', 'Serbian Dinar', 'en', 'Europe'),
('Slovakia', 'SK', 'SVK', '+421', 'EUR', '€', 'Euro', 'en', 'Europe'),
('Slovenia', 'SI', 'SVN', '+386', 'EUR', '€', 'Euro', 'en', 'Europe'),
('Spain', 'ES', 'ESP', '+34', 'EUR', '€', 'Euro', 'es', 'Europe'),
('Sweden', 'SE', 'SWE', '+46', 'SEK', 'kr', 'Swedish Krona', 'en', 'Europe'),
('Switzerland', 'CH', 'CHE', '+41', 'CHF', 'CHF', 'Swiss Franc', 'en', 'Europe'),
('Ukraine', 'UA', 'UKR', '+380', 'UAH', '₴', 'Ukrainian Hryvnia', 'en', 'Europe'),
('United Kingdom', 'GB', 'GBR', '+44', 'GBP', '£', 'British Pound', 'en', 'Europe'),
('Vatican City', 'VA', 'VAT', '+379', 'EUR', '€', 'Euro', 'en', 'Europe'),
('Argentina', 'AR', 'ARG', '+54', 'ARS', '$', 'Argentine Peso', 'es', 'Americas'),
('Belize', 'BZ', 'BLZ', '+501', 'BZD', 'BZ$', 'Belize Dollar', 'en', 'Americas'),
('Bolivia', 'BO', 'BOL', '+591', 'BOB', 'Bs', 'Bolivian Boliviano', 'es', 'Americas'),
('Brazil', 'BR', 'BRA', '+55', 'BRL', 'R$', 'Brazilian Real', 'pt', 'Americas'),
('Canada', 'CA', 'CAN', '+1', 'CAD', 'C$', 'Canadian Dollar', 'en', 'Americas'),
('Chile', 'CL', 'CHL', '+56', 'CLP', '$', 'Chilean Peso', 'es', 'Americas'),
('Colombia', 'CO', 'COL', '+57', 'COP', '$', 'Colombian Peso', 'es', 'Americas'),
('Costa Rica', 'CR', 'CRI', '+506', 'CRC', '₡', 'Costa Rican Colon', 'es', 'Americas'),
('Cuba', 'CU', 'CUB', '+53', 'CUP', '$', 'Cuban Peso', 'es', 'Americas'),
('Dominican Republic', 'DO', 'DOM', '+1', 'DOP', 'RD$', 'Dominican Peso', 'es', 'Americas'),
('Ecuador', 'EC', 'ECU', '+593', 'USD', '$', 'US Dollar', 'es', 'Americas'),
('El Salvador', 'SV', 'SLV', '+503', 'USD', '$', 'US Dollar', 'es', 'Americas'),
('Guatemala', 'GT', 'GTM', '+502', 'GTQ', 'Q', 'Guatemalan Quetzal', 'es', 'Americas'),
('Guyana', 'GY', 'GUY', '+592', 'GYD', 'G$', 'Guyanese Dollar', 'en', 'Americas'),
('Haiti', 'HT', 'HTI', '+509', 'HTG', 'G', 'Haitian Gourde', 'fr', 'Americas'),
('Honduras', 'HN', 'HND', '+504', 'HNL', 'L', 'Honduran Lempira', 'es', 'Americas'),
('Jamaica', 'JM', 'JAM', '+1', 'JMD', 'J$', 'Jamaican Dollar', 'en', 'Americas'),
('Mexico', 'MX', 'MEX', '+52', 'MXN', 'Mex$', 'Mexican Peso', 'es', 'Americas'),
('Nicaragua', 'NI', 'NIC', '+505', 'NIO', 'C$', 'Nicaraguan Cordoba', 'es', 'Americas'),
('Panama', 'PA', 'PAN', '+507', 'USD', '$', 'US Dollar', 'es', 'Americas'),
('Paraguay', 'PY', 'PRY', '+595', 'PYG', '₲', 'Paraguayan Guarani', 'es', 'Americas'),
('Peru', 'PE', 'PER', '+51', 'PEN', 'S/', 'Peruvian Sol', 'es', 'Americas'),
('Suriname', 'SR', 'SUR', '+597', 'SRD', 'Sr$', 'Surinamese Dollar', 'en', 'Americas'),
('United States', 'US', 'USA', '+1', 'USD', '$', 'US Dollar', 'en', 'Americas'),
('Uruguay', 'UY', 'URY', '+598', 'UYU', 'U$', 'Uruguayan Peso', 'es', 'Americas'),
('Venezuela', 'VE', 'VEN', '+58', 'VES', 'Bs', 'Venezuelan Bolivar', 'es', 'Americas'),
('Australia', 'AU', 'AUS', '+61', 'AUD', 'A$', 'Australian Dollar', 'en', 'Oceania'),
('Fiji', 'FJ', 'FJI', '+679', 'FJD', 'FJ$', 'Fijian Dollar', 'en', 'Oceania'),
('Kiribati', 'KI', 'KIR', '+686', 'AUD', 'A$', 'Australian Dollar', 'en', 'Oceania'),
('Marshall Islands', 'MH', 'MHL', '+692', 'USD', '$', 'US Dollar', 'en', 'Oceania'),
('Micronesia', 'FM', 'FSM', '+691', 'USD', '$', 'US Dollar', 'en', 'Oceania'),
('Nauru', 'NR', 'NRU', '+674', 'AUD', 'A$', 'Australian Dollar', 'en', 'Oceania'),
('New Zealand', 'NZ', 'NZL', '+64', 'NZD', 'NZ$', 'New Zealand Dollar', 'en', 'Oceania'),
('Palau', 'PW', 'PLW', '+680', 'USD', '$', 'US Dollar', 'en', 'Oceania'),
('Papua New Guinea', 'PG', 'PNG', '+675', 'PGK', 'K', 'Papua New Guinean Kina', 'en', 'Oceania'),
('Samoa', 'WS', 'WSM', '+685', 'WST', 'T', 'Samoan Tala', 'en', 'Oceania'),
('Solomon Islands', 'SB', 'SLB', '+677', 'SBD', 'SI$', 'Solomon Islands Dollar', 'en', 'Oceania'),
('Tonga', 'TO', 'TON', '+676', 'TOP', 'T$', 'Tongan Paanga', 'en', 'Oceania'),
('Tuvalu', 'TV', 'TUV', '+688', 'AUD', 'A$', 'Australian Dollar', 'en', 'Oceania'),
('Vanuatu', 'VU', 'VUT', '+678', 'VUV', 'Vt', 'Vanuatu Vatu', 'en', 'Oceania')
ON CONFLICT (iso2) DO NOTHING;

-- Extend clinics table
DO $$ BEGIN
  ALTER TABLE clinics ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
  ALTER TABLE clinics ADD COLUMN IF NOT EXISTS instapay_handle TEXT;
  ALTER TABLE clinics ADD COLUMN IF NOT EXISTS instapay_url TEXT;
  ALTER TABLE clinics ADD COLUMN IF NOT EXISTS facebook_url TEXT;
  ALTER TABLE clinics ADD COLUMN IF NOT EXISTS instagram_url TEXT;
  ALTER TABLE clinics ADD COLUMN IF NOT EXISTS website_url TEXT;
  ALTER TABLE clinics ADD COLUMN IF NOT EXISTS ai_provider TEXT DEFAULT 'openai';
  ALTER TABLE clinics ADD COLUMN IF NOT EXISTS ai_api_key_encrypted TEXT;
  ALTER TABLE clinics ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'en';
  ALTER TABLE clinics ADD COLUMN IF NOT EXISTS country_id INTEGER REFERENCES countries(id);
  ALTER TABLE clinics ADD COLUMN IF NOT EXISTS tax_percentage NUMERIC(5,2) DEFAULT 0;
  ALTER TABLE clinics ADD COLUMN IF NOT EXISTS invoice_prefix TEXT DEFAULT 'INV';
  ALTER TABLE clinics ADD COLUMN IF NOT EXISTS city TEXT;
  ALTER TABLE clinics ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
  ALTER TABLE clinics ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'USD';
  ALTER TABLE clinics ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Extend profiles with country_id
DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country_id INTEGER REFERENCES countries(id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- AI Chat Messages table
CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  radiology_image_id UUID REFERENCES radiology_images(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_ai_chat_messages" ON ai_chat_messages;
CREATE POLICY "select_ai_chat_messages" ON ai_chat_messages FOR SELECT TO authenticated
USING (clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid()));
DROP POLICY IF EXISTS "insert_ai_chat_messages" ON ai_chat_messages;
CREATE POLICY "insert_ai_chat_messages" ON ai_chat_messages FOR INSERT TO authenticated
WITH CHECK (clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid()));
DROP POLICY IF EXISTS "delete_ai_chat_messages" ON ai_chat_messages;
CREATE POLICY "delete_ai_chat_messages" ON ai_chat_messages FOR DELETE TO authenticated
USING (clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid()));
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_image ON ai_chat_messages(radiology_image_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_patient ON ai_chat_messages(patient_id);

-- Radiology Comparisons table
CREATE TABLE IF NOT EXISTS radiology_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  image_a_id UUID NOT NULL REFERENCES radiology_images(id) ON DELETE CASCADE,
  image_b_id UUID NOT NULL REFERENCES radiology_images(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE radiology_comparisons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_radiology_comparisons" ON radiology_comparisons;
CREATE POLICY "select_radiology_comparisons" ON radiology_comparisons FOR SELECT TO authenticated
USING (clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid()));
DROP POLICY IF EXISTS "insert_radiology_comparisons" ON radiology_comparisons;
CREATE POLICY "insert_radiology_comparisons" ON radiology_comparisons FOR INSERT TO authenticated
WITH CHECK (clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid()));
DROP POLICY IF EXISTS "delete_radiology_comparisons" ON radiology_comparisons;
CREATE POLICY "delete_radiology_comparisons" ON radiology_comparisons FOR DELETE TO authenticated
USING (clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid()));
CREATE INDEX IF NOT EXISTS idx_radiology_comparisons_patient ON radiology_comparisons(patient_id);
