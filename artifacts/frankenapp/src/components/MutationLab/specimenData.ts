/* ── Shared types and data — no React components here ── */

export interface AppDNA {
  category: string;
  audience: string;
  platform: string;
  corePurpose: string;
}

export interface BaseSpecimen {
  codename: string;
  image: string;
  status: string;
}

export const SPECIMEN_MAP: Record<string, BaseSpecimen> = {
  'Finance':                { codename:'VAULTBELLY',     image:'/landing/specimen-01-finance.png',      status:'BALANCED — FOR NOW'     },
  'Restaurant':             { codename:'OVENMOUTH',       image:'/landing/specimen-02-restaurant.png',   status:'PERMANENTLY PREHEATED'  },
  'Real Estate':            { codename:'BRICK-EYE',       image:'/landing/specimen-03-realestate.png',   status:'LOCATION VERIFIED'      },
  'Ecommerce':              { codename:'PARCEL MAW',      image:'/landing/specimen-04-ecommerce.png',    status:'ORDERS PENDING'         },
  'Social':                 { codename:'THE ECHO COLONY', image:'/landing/specimen-05-social.png',       status:'CURRENTLY TRENDING'     },
  'Productivity / SaaS':    { codename:'TASKCRAWLER',     image:'/landing/specimen-06-productivity.png', status:'SYNCING…'               },
  'Education':              { codename:'CORTEX MINOR',    image:'/landing/specimen-07-education.png',    status:'STILL ASKING WHY'       },
  'Health':                 { codename:'PULSE SLUG',      image:'/landing/specimen-08-health.png',       status:'VITAL SIGNS DRAMATIC'   },
  'Travel / Hospitality':   { codename:'COMPASS HOUND',   image:'/landing/specimen-09-travel.png',       status:'GATE CHANGED'           },
  'Gaming / Entertainment': { codename:'RAGEHOPPER',      image:'/landing/specimen-10-gaming.png',       status:'PLAYER TWO MISSING'     },
  'Creator / Media':        { codename:'INK KRAKEN',      image:'/landing/specimen-11-creator.png',      status:'CURRENTLY RECORDING'    },
  'Developer / AI':         { codename:'SOCKET ORACLE',   image:'/landing/specimen-12-developer.png',    status:'DO NOT UNPLUG'          },
};
