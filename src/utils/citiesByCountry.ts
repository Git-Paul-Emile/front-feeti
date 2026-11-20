// Villes principales par code pays (ISO 3166-1 alpha-2).
// Sert aux sélecteurs de ville dépendants du pays choisi.
export const CITIES_BY_COUNTRY_CODE: Record<string, string[]> = {
  CG: ['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Nkayi', 'Ouesso', 'Impfondo', 'Madingou', 'Owando', 'Sibiti', 'Mossendjo'],
  CD: ['Kinshasa', 'Lubumbashi', 'Mbuji-Mayi', 'Kananga', 'Kisangani', 'Goma', 'Bukavu', 'Bunia', 'Matadi', 'Kolwezi'],
  GA: ['Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda', 'Mouila', 'Lambaréné', 'Tchibanga'],
  CI: ['Abidjan', 'Bouaké', 'Daloa', 'San-Pédro', 'Yamoussoukro', 'Divo', 'Man', 'Gagnoa', 'Korhogo'],
  CM: ['Yaoundé', 'Douala', 'Garoua', 'Bafoussam', 'Bamenda', 'Maroua', 'Nkongsamba', 'Ngaoundéré', 'Bertoua'],
  SN: ['Dakar', 'Thiès', 'Kaolack', 'Saint-Louis', 'Ziguinchor', 'Mbour', 'Diourbel', 'Tambacounda'],
  ML: ['Bamako', 'Sikasso', 'Ségou', 'Mopti', 'Kayes', 'Gao', 'Koutiala', 'Kidal'],
  BF: ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Banfora', 'Ouahigouya', 'Kaya'],
  NE: ['Niamey', 'Zinder', 'Maradi', 'Agadez', 'Dosso', 'Tahoua', 'Diffa'],
  TD: ["N'Djamena", 'Moundou', 'Sarh', 'Abéché', 'Kélo', 'Bongor'],
  CF: ['Bangui', 'Bimbo', 'Carnot', 'Bambari', 'Bangassou', 'Berberati'],
  TG: ['Lomé', 'Sokodé', 'Kara', 'Atakpamé', 'Bassar', 'Tsévié'],
  BJ: ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey', 'Natitingou', 'Bohicon'],
  GN: ['Conakry', 'Nzérékoré', 'Kankan', 'Kindia', 'Labé', 'Boké'],
  GQ: ['Malabo', 'Bata', 'Ebebiyín', 'Aconibe', 'Evinayong'],
  AO: ['Luanda', 'Huambo', 'Lobito', 'Benguela', 'Kuito', 'Lubango'],
  FR: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'],
  BE: ['Bruxelles', 'Anvers', 'Gand', 'Liège', 'Bruges', 'Namur'],
};

export function getCitiesForCountry(countryCode?: string | null): string[] {
  if (!countryCode) return [];
  return CITIES_BY_COUNTRY_CODE[countryCode.toUpperCase()] ?? [];
}
