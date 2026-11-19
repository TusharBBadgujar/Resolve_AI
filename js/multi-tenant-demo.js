const tenantPreviews = {
  northstar: {
    name: 'Northstar Goods',
    session: 'tenant: northstar · session A',
    user: 'Alex Morgan · alex@northstar.example',
    order: 'NG-1042 · Ceramic pour-over set',
    status: 'Processing'
  },
  fern: {
    name: 'Fern & Found',
    session: 'tenant: fern · session B',
    user: 'Maya Chen · maya@fern.example',
    order: 'FF-2281 · Indoor herb planter',
    status: 'Shipped'
  },
  orbit: {
    name: 'Orbit Outfitters',
    session: 'tenant: orbit · session C',
    user: 'Jamie Patel · jamie@orbit.example',
    order: 'OO-5504 · Trail jacket',
    status: 'Delivered'
  }
};

const tenantPreviewFields = {
  name: document.getElementById('tenant-store-name'),
  session: document.getElementById('tenant-session-id'),
  user: document.getElementById('tenant-user'),
  order: document.getElementById('tenant-order'),
  status: document.getElementById('tenant-order-status')
};

const tenantIsolationStatus = document.getElementById('tenant-isolation-status');

document.querySelectorAll('[data-tenant-select]').forEach(button => {
  button.addEventListener('click', () => {
    const tenant = tenantPreviews[button.dataset.tenantSelect];
    if (!tenant) {
      return;
    }

    tenantPreviewFields.name.textContent = tenant.name;
    tenantPreviewFields.session.textContent = tenant.session;
    tenantPreviewFields.user.textContent = tenant.user;
    tenantPreviewFields.order.textContent = tenant.order;
    tenantPreviewFields.status.textContent = tenant.status;

    document.querySelectorAll('[data-tenant-select]').forEach(option => {
      const selected = option === button;
      option.classList.toggle('is-selected', selected);
      option.setAttribute('aria-pressed', String(selected));
    });

    tenantIsolationStatus.lastElementChild.textContent =
      `Previewing ${tenant.name}: only its fictional sample order is shown in this workspace. Server-side tenant checks are required to enforce this boundary in a real system.`;
  });
});
