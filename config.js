'use strict';

const config = {
  style: 'mapbox://styles/mapbox/light-v11',
  accessToken:
    'pk.eyJ1IjoibXR0bm8xIiwiYSI6ImNscGNyeGl0cjB1OTEyam5rOG1tdmF3enAifQ.TRQ0vxWHwNV3emQborqVBA',
  CSV: 'https://raw.githubusercontent.com/mttno1/impact-tools/master/innovationSpaces.csv',
  center: [11.0821, 49.446],
  zoom: 12.5,
  title: 'Innovationsräume',
  description:
    '',
  sideBarInfo: ['Location_Name'],
  popupInfo: ['Description'],
  filters: [
    {
      type: 'checkbox',
      title: 'Standort ',
      columnHeader: 'City', // Case sensitive - must match spreadsheet entry
      listItems: [
          'Bamberg',
          'Erlangen',
          'Fürth',
          'Nürnberg',
          'Schnaittach',
          'Veitsbronn'
      ]
    },

    {  
      type: 'checkbox',
      title: 'Kategorie',
      columnHeader: 'Category',
      listItems: [
        'Accelerator',
        'Cluster & Innovationsagentur',
        'Coworking Space',
        'Fablab',
        'Gründerzentrum',
        'HackerSpace',
        'Innovationslabor',
        'MakerSpace',
        'Technologietransferzentrum',
        'Universitäre und außeruniversitäre Forschung'
    ]
    ,
    },
    {
      type: 'dropdown',
      title: 'Zielgruppe ',
      columnHeader: 'Target_Group',
      listItems: [
        'Architekten',
        'Aussteller',
        'Bastler',
        'Besucher',
        'Branchenakteure',
        'Bürger',
        'Entwickler',
        'Forschende',
        'Forschungseinrichtungen',
        'Frauen',
        'Freiberufler',
        'Geeks',
        'Geschäftsreisende',
        'Gesundheits- und Sozialeinrichtungen',
        'Gesundheitsdienstleister',
        'Hacker',
        'Heimwerker',
        'Hochschulen',
        'IT- und Open-Source-Community',
        'Industriepartner',
        'Innovatoren',
        'Institutionen',
        'Interessiert an Technologie und Handwerk',
        'Interessierte an Kultur',
        'Interessierte an Kunst und Handarbeit',
        'Interessierte an Technologie',
        'Interessierte an XR-Technologien',
        'Kinder und Jugendliche',
        'Konstrukteure',
        'Krankenhäuser',
        'Kreative',
        'Künstler',
        'Lehrende',
        'Maker',
        'Medizinische Einrichtungen',
        'Nerds',
        'Organisationen',
        'Patienten',
        'Programmierer',
        'Schüler:innen',
        'Selbständige',
        'Stadtplaner',
        'Start-ups',
        'Studieninteressierte',
        'Studierende',
        'Teams',
        'Unternehmen',
        'Unternehmen aus IT',
        'Unternehmen aus Medizintechnik',
        'Unternehmen der Gesundheitsbranche',
        'Unternehmen in der Energiebranche',
        'Unternehmengründer',
        'Veranstalter',
        'Wissenschaftler',
        'Wissenschaftscommunity',
        'Öffentliche Hand'
    ]
    },
  ],
};

