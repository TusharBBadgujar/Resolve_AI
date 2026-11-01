const sectionComponents = [
  { key: 'navbar', mountId: 'mount-navbar', name: 'Navbar' },
  { key: 'reactCycle', mountId: 'mount-react-cycle', name: 'ReAct Cycle' },
  { key: 'customerSupport', mountId: 'mount-customer-support', name: 'Customer Support' },
  { key: 'reasoningEngine', mountId: 'mount-reasoning-engine', name: 'Reasoning Engine' },
  { key: 'demoConsole', mountId: 'mount-demo-console', name: 'Demo Data & Guardrails' },
  { key: 'aboutProject', mountId: 'mount-about-project', name: 'About & Contact' },
  { key: 'footer', mountId: 'mount-footer', name: 'Footer' }
];

const missingSections = sectionComponents
  .filter(section => !window.ResolvAISections?.[section.key])
  .map(section => section.name);

if (missingSections.length > 0) {
  const loadError = document.getElementById('section-load-error');
  loadError.textContent = `Unable to load these page sections: ${missingSections.join(', ')}. Make sure the section folders are beside index.html and open the site through a local web server.`;
  loadError.classList.remove('hidden');
  throw new Error(`Missing page sections: ${missingSections.join(', ')}`);
}

for (const section of sectionComponents) {
  const mount = document.getElementById(section.mountId);
  if (!mount) {
    throw new Error(`Missing mount point for ${section.name}: #${section.mountId}`);
  }

  mount.insertAdjacentHTML('beforeend', window.ResolvAISections[section.key]);
}
