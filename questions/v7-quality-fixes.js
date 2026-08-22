const replaceV7Question=(id,replacement)=>{
  const index=QUESTIONS.findIndex(q=>q.id===id);
  if(index<0) throw new Error(`Missing V7 question to replace: ${id}`);
  QUESTIONS[index]=replacement;
};

replaceV7Question("V7G051",Q("V7G051","geographie","easy","Dans quel pays se trouve la région historique de Transylvanie ?",["La Hongrie","La Roumanie","La Bulgarie","La Serbie"],1,"La Transylvanie se trouve au centre de la Roumanie.",["Roumanie"]));
replaceV7Question("V7G054",Q("V7G054","geographie","easy","Quelle capitale européenne est traversée par la Vltava ?",["Prague","Vienne","Varsovie","Sofia"],0,"La Vltava traverse Prague avant de rejoindre l’Elbe.",["Prague"]));
replaceV7Question("V7G057",Q("V7G057","geographie","easy","Sur quelle île italienne se trouve le volcan Etna ?",["Sardaigne","Capri","Sicile","Elbe"],2,"L’Etna se trouve en Sicile, près de Catane.",["Sicile"]));
replaceV7Question("V7G059",Q("V7G059","geographie","easy","Quel pays d’Afrique a pour capitale Gaborone ?",["La Namibie","Le Zimbabwe","La Zambie","Le Botswana"],3,"Gaborone est la capitale du Botswana.",["Botswana"]));
replaceV7Question("V7G060",Q("V7G060","geographie","easy","Quel océan borde la longue côte occidentale du Chili ?",["L’océan Pacifique","L’océan Indien","L’océan Atlantique","L’océan Arctique"],0,"Le Chili s’étire le long de la côte pacifique de l’Amérique du Sud.",["Pacifique","Océan Pacifique"]));
replaceV7Question("V7G061",Q("V7G061","geographie","easy","Quel archipel portugais se situe dans l’Atlantique Nord à l’ouest du Portugal continental ?",["Les Baléares","Les Açores","Les Cyclades","Les Shetland"],1,"Les Açores sont un archipel autonome portugais de l’Atlantique Nord.",["Açores","Acores"]));
replaceV7Question("V7G062",Q("V7G062","geographie","easy","Quel pays a pour capitale Tbilissi ?",["L’Arménie","L’Azerbaïdjan","La Géorgie","La Moldavie"],2,"Tbilissi est la capitale de la Géorgie.",["Géorgie","Georgie"]));
replaceV7Question("V7G063",Q("V7G063","geographie","normal","Quel fleuve forme une partie importante de la frontière entre l’Allemagne et la Pologne ?",["L’Oder","Le Danube","Le Pô","La Seine"],0,"L’Oder, avec son affluent la Neisse, forme une grande partie de la frontière germano-polonaise.",["Oder","Odra"]));
replaceV7Question("V7G067",Q("V7G067","geographie","normal","Dans quel pays se trouve principalement le désert du Namib ?",["Le Botswana","La Namibie","Le Kenya","Le Mozambique"],1,"Le désert du Namib s’étend principalement le long de la côte de la Namibie.",["Namibie"]));
replaceV7Question("V7G071",Q("V7G071","geographie","normal","Quelle capitale nordique est construite sur de nombreuses îles entre le lac Mälar et la mer Baltique ?",["Oslo","Helsinki","Stockholm","Copenhague"],2,"Stockholm s’étend sur plusieurs îles entre le lac Mälar et la mer Baltique.",["Stockholm"]));
replaceV7Question("V7G075",Q("V7G075","geographie","normal","À quel pays appartient l’île de Java ?",["Les Philippines","La Malaisie","Le Sri Lanka","L’Indonésie"],3,"Java est l’une des principales îles de l’Indonésie.",["Indonésie","Indonesie"]));
replaceV7Question("V7G080",Q("V7G080","geographie","hard","Quel détroit japonais sépare les îles de Honshū et Hokkaidō ?",["Le détroit de Tsugaru","Le détroit de La Pérouse","Le détroit de Corée","Le détroit de Bungo"],0,"Le détroit de Tsugaru sépare Honshū de Hokkaidō.",["Tsugaru"]));

replaceV7Question("V7S055",Q("V7S055","sciences","easy","Quels organes filtrent le sang et produisent l’urine ?",["Les poumons","Les reins","Le pancréas","La rate"],1,"Les reins filtrent le sang et produisent l’urine.",["Reins","Les reins"]));

replaceV7Question("V7C058",Q("V7C058","cinema","easy","Quel film d’animation Pixar met en scène la famille de super-héros Parr ?",["Cars","Ratatouille","Les Indestructibles","Là-haut"],2,"Les Indestructibles suit la famille Parr, dont les membres possèdent des super-pouvoirs.",["Les Indestructibles","The Incredibles"]));
replaceV7Question("V7C059",Q("V7C059","cinema","easy","Comment s’appelle le père de Simba dans « Le Roi Lion » ?",["Scar","Rafiki","Timon","Mufasa"],3,"Mufasa est le père de Simba et le roi de la Terre des Lions.",["Mufasa"]));
replaceV7Question("V7C065",Q("V7C065","cinema","normal","Quel réalisateur sud-coréen signe « Oldboy » sorti en 2003 ?",["Park Chan-wook","Bong Joon-ho","Kim Jee-woon","Lee Chang-dong"],0,"Oldboy, sorti en 2003, est réalisé par Park Chan-wook.",["Park Chan Wook"]));

replaceV7Question("V7J056",Q("V7J056","jeux","easy","Quelle créature verte de « Minecraft » explose lorsqu’elle s’approche du joueur ?",["Un zombie","Un Creeper","Un Enderman","Un Slime"],1,"Le Creeper est une créature emblématique de Minecraft qui explose près du joueur.",["Creeper"]));

replaceV7Question("V7T065",Q("V7T065","tech","normal","Quel protocole de transport Internet est orienté connexion et garantit l’ordre des octets reçus ?",["UDP","ARP","TCP","ICMP"],2,"TCP établit une connexion et fournit un flux d’octets fiable et ordonné.",["TCP"]));
replaceV7Question("V7T066",Q("V7T066","tech","normal","Quel système de fichiers Linux journalisé succède directement à ext3 et est très répandu ?",["NTFS","APFS","FAT32","ext4"],3,"ext4 succède à ext3 et est largement utilisé sur les systèmes Linux.",["ext4","EXT4"]));

replaceV7Question("V7SP051",Q("V7SP051","sport","easy","Dans quel sport utilise-t-on un palet sur une patinoire ?",["Hockey sur glace","Curling uniquement avec une crosse","Polo","Squash"],0,"Au hockey sur glace, les joueurs déplacent un palet avec leur crosse.",["Hockey","Hockey sur glace"]));

replaceV7Question("V7I065",Q("V7I065","insolite","normal","Quel rongeur possède des incisives naturellement orangées à cause d’un émail riche en fer ?",["Le hamster","Le castor","Le chinchilla","Le cobaye"],1,"Les incisives du castor ont une couche d’émail riche en fer qui leur donne une teinte orangée.",["Castor"]));

replaceV7Question("V7R088",Q("V7R088","retro","hard","Quel site français de partage de vidéos lancé en 2005 devient rapidement un concurrent européen de YouTube ?",["Wat.tv","Dailymotion","Vine","Metacafe"],1,"Dailymotion est lancé en France en 2005 et devient rapidement une plateforme vidéo importante.",["DailyMotion"]));
