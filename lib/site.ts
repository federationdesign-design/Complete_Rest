// Site-wide navigation and contact details, taken from the live WordPress menus.

export type NavLink = { label: string; href: string };

export const contact = {
  phoneDisplay: '07973424181',
  phoneHref: 'tel:07973424181',
  email: 'info@completerestoration.co.uk',
  emailHref: 'mailto:info@completerestoration.co.uk',
};

export const siteName = 'The Complete Restoration Company';

export const mainNav: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about/' },
  { label: 'Services', href: '/services/' },
  { label: 'Case studies', href: '/case-studies/' },
  { label: 'Internal', href: '/internal/' },
  { label: 'External', href: '/external/' },
  { label: 'Contact us', href: '/contact-us/' },
];

export type FooterMenu = { title: string; href?: string; links: NavLink[] };

// Order and the "Main menu" title (was "Quick Nav") are from round 3.
export const footerMenus: FooterMenu[] = [
  {
    title: 'Main menu',
    links: [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about/' },
      { label: 'Ethos', href: '/about/our-ethos/' },
      { label: 'Team', href: '/about/our-team/' },
      { label: 'Services', href: '/services/' },
      { label: 'External', href: '/external/' },
      { label: 'Internal', href: '/internal/' },
      { label: 'Structural', href: '/external/structural/' },
      { label: 'Kitchens', href: '/internal/kitchens/' },
      { label: 'Wet Rooms', href: '/internal/wet-rooms/' },
    ],
  },
  {
    title: 'Services',
    href: '/services/',
    links: [
      { label: 'Building Restoration', href: '/services/building-restoration/' },
      { label: 'Sash Window Restoration', href: '/external/sash-window-restoration/' },
      { label: 'Brick and Stone Cleaning', href: '/services/brick-and-stone-cleaning/' },
      { label: 'Staircase Refurb', href: '/internal/staircase-refurb/' },
      { label: 'Floor Restoration', href: '/services/floor-restoration/' },
      { label: 'Brickwork', href: '/external/brickwork/' },
      { label: 'Decorating', href: '/internal/decorating/' },
      { label: 'Doff', href: '/services/doff/' },
      { label: 'Hand Stripping', href: '/services/hand-stripping/' },
      { label: 'Metal Polishing', href: '/services/metal-polishing/' },
      { label: 'Shot Blasting', href: '/services/shot-blasting/' },
    ],
  },
  {
    title: 'Case studies',
    href: '/case-studies/',
    links: [
      { label: 'Imperial College of Science', href: '/case-studies/imperialscience-collage/' },
      { label: 'Haileybury College', href: '/case-studies/haileybury-collages/' },
      { label: 'Halcyon Gallery', href: '/case-studies/halcyon-gallery/' },
      { label: 'Victorian Residence', href: '/case-studies/victorian-residence/' },
    ],
  },
  {
    title: 'Customer services',
    links: [
      { label: 'Contact us', href: '/contact-us/' },
      { label: 'Privacy policy', href: '/contact-us/privacy-policy/' },
      { label: 'Cookies policy', href: '/contact-us/cookies-policy/' },
      { label: 'Disclaimer', href: '/contact-us/disclaimer/' },
    ],
  },
];

// A link is current when it matches the path exactly, or is the parent
// section of the current path (but never for Home).
export function isCurrent(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href);
}
