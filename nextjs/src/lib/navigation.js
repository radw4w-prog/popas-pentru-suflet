// Sursă comună pentru desktop și mobil. URL-urile existente sunt păstrate.
export const isNavActive = (pathname, path) => pathname === path || pathname.startsWith(path + '/');
export function navigationGroups(authenticated, admin) {
  return [
    { title: 'În fiecare zi', items: [
      {path: authenticated ? '/dashboard' : '/landing', icon: '🏠', label: 'Acasă'},
      {path: '/devotional', icon: '🙏', label: 'Devoționalul zilei'},
    ]},
    { title: 'Cuvântul', items: [
      {path: '/biblia', icon: '📖', label: 'Citește Biblia'},
      {path: '/audio', icon: '🎧', label: 'Ascultă Biblia'},
    ]},
    ...(authenticated ? [{title: 'Spațiul meu', items: [
      {path: '/spatiul-meu', icon: '👤', label: 'Spațiul meu'},
      {path: '/reading', icon: '📗', label: 'Plan de citire'},
      {path: '/journey', icon: '🕊️', label: 'Progres spiritual'},
      {path: '/journal', icon: '📔', label: 'Jurnalul meu'},
      {path: '/bookmarks', icon: '🔖', label: 'Versete salvate'},
      {path: '/profile', icon: '👤', label: 'Profilul meu'},
      {path: '/notifications', icon: '🔔', label: 'Notificări'},
    ]}] : []),
    {title: 'Comunitate & inspirație', items: [
      {path: '/rugaciuni', icon: '🙏', label: 'Cereri de rugăciune'},
      {path: '/generate', icon: '✨', label: 'Imagini cu versete'},
    ]},
    ...(admin ? [{title: 'Administrare', items: [
      {path: '/schedule', icon: '📅', label: 'Programare'},
      {path: '/history', icon: '📜', label: 'Istoric publicări'},
      {path: '/analytics', icon: '📊', label: 'Statistici'},
      {path: '/settings', icon: '⚙️', label: 'Setări publicare'},
      {path: '/admin', icon: '🛡️', label: 'Administrare'},
    ]}] : []),
  ];
}
