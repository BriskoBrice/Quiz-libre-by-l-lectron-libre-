const CATEGORIES={
  histoire:{name:'Histoire',emoji:'📜'},geographie:{name:'Géographie',emoji:'🗺️'},sciences:{name:'Sciences',emoji:'🔬'},cinema:{name:'Cinéma & séries',emoji:'🎬'},
  jeux:{name:'Jeux vidéo',emoji:'🎮'},musique:{name:'Musique',emoji:'🎵'},tech:{name:'Tech',emoji:'💻'},sport:{name:'Sport',emoji:'🏆'},retro:{name:'Années 90/2000',emoji:'📼'},insolite:{name:'Insolite',emoji:'🤯'}
};
const DNAME={easy:'Facile',normal:'Normal',hard:'Difficile',expert:'Expert'};
const Q=(id,cat,diff,q,opts,a,ex,accepted=[])=>({id,cat,diff,q,opts,a,ex,accepted});
const QUESTIONS=[];
