// State & Mock Database
    const initialOrders = [
      {
        orderId: "ORD-8492",
        customerName: "Rahul Sharma",
        email: "rahul.s@example.com",
        itemName: "boAt Rockerz 450 Bluetooth Headphones",
        amountINR: 899,
        status: "Delivered",
        shippingAddress: "Flat 204, Green Glen Layout, Bengaluru",
        trackingId: "BLUEDART-882190",
        carrier: "BlueDart Express"
      },
      {
        orderId: "ORD-3120",
        customerName: "Pooja Verma",
        email: "pooja.v@example.com",
        itemName: "Puma Smashic Unisex Sneakers (Size UK 7)",
        amountINR: 2499,
        status: "Shipped",
        shippingAddress: "B-12, Sector 62, Noida, UP",
        trackingId: "DELHIVERY-774102",
        carrier: "Delhivery"
      },
      {
        orderId: "ORD-9914",
        customerName: "Aditya Nair",
        email: "aditya.n@example.com",
        itemName: "Logitech MX Master 3S Mouse",
        amountINR: 7995,
        status: "Processing",
        shippingAddress: "Room 108, Boys Hostel 2, COEP Tech, Pune",
        trackingId: "PENDING_DISPATCH",
        carrier: "DTDC"
      },
      {
        orderId: "ORD-5501",
        customerName: "Vikram Malhotra",
        email: "vikram.m@example.com",
        itemName: "Sony Bravia 55-inch 4K Smart TV",
        amountINR: 54990,
        status: "Delivered",
        shippingAddress: "Villa 45, Palm Meadows, Bengaluru",
        trackingId: "BLUEDART-110943",
        carrier: "BlueDart Express"
      }
    ];

    let liveOrders = JSON.parse(JSON.stringify(initialOrders));
    let auditLedger = [
      {
        txId: "TXN-INIT-001",
        orderId: "ORD-8492",
        amountINR: 899,
        type: "PAYMENT_CAPTURE",
        timestamp: "2026-10-24 10:14:22",
        status: "SUCCESS"
      },
      {
        txId: "TXN-INIT-002",
        orderId: "ORD-3120",
        amountINR: 2499,
        type: "PAYMENT_CAPTURE",
        timestamp: "2026-10-25 14:30:10",
        status: "SUCCESS"
      }
    ];

    let databaseConnected = false;

    async function apiRequest(url, options = {}) {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || `Request failed with status ${response.status}.`);
      }
      return result;
    }

    async function refreshDatabaseState() {
      const state = await apiRequest('/api/state');
      if (!Array.isArray(state.orders) || !Array.isArray(state.transactions)) {
        throw new Error('MongoDB returned an invalid state response.');
      }
      liveOrders = state.orders;
      auditLedger = state.transactions;
      databaseConnected = true;
      renderOrders();
      renderTransactions();
      updateDatabaseBadge(true);
    }

    function updateDatabaseBadge(connected) {
      const badge = document.getElementById('badge-stack-tag');
      badge.textContent = connected ? 'MongoDB • Resolve_AI' : 'MongoDB • Disconnected';
      badge.classList.toggle('bg-emerald-500/10', connected);
      badge.classList.toggle('text-emerald-400', connected);
      badge.classList.toggle('border-emerald-500/30', connected);
      badge.classList.toggle('bg-rose-500/10', !connected);
      badge.classList.toggle('text-rose-400', !connected);
      badge.classList.toggle('border-rose-500/30', !connected);
    }

    async function initializeDatabase() {
      try {
        await apiRequest('/api/health');
        await refreshDatabaseState();
      } catch (error) {
        databaseConnected = false;
        updateDatabaseBadge(false);
        const loadError = document.getElementById('section-load-error');
        loadError.textContent = `MongoDB is not connected. Start the MongoDB service and run "npm start" from the project folder. ${error.message}`;
        loadError.classList.remove('hidden');
      }
    }

    const AUTO_REFUND_LIMIT = 2000;
    let currentLanguage = 'en';
    let executionMode = 'auto'; // 'auto' | 'step'
    let currentTraceSteps = [];
    let currentStepIndex = 0;
    let isProcessing = false;
    let activeUtterance = null;

    // Comprehensive Bilingual Localization Dictionary
    const i18n = {
      en: {
        agentTag: "ReAct Autonomous Agent",
        stackTag: "MongoDB • Resolve_AI",
        headerSubtitle: "Homingo Hack Days 2026 • Track: Agents (Planning, Tools & Safety)",
        modeAuto: "Auto Run",
        modeStep: "Step-by-Step",
        resetBtn: "Reset Data",
        modalBtn: "Architecture & Rubric",
        phase1: "1. Perception (NLU)",
        phase2: "2. Tool Planning",
        phase3: "3. Safety Guardrail",
        phase4: "4. Tool Execution",
        phase5: "5. Synthesis",
        cycleTitle: "ReAct Cycle:",
        navCycle: "ReAct Cycle",
        navSupport: "Customer Support",
        navEngine: "Reasoning Engine",
        navData: "Demo Data & Guardrails",
        navAbout: "About & Contact",
        col1Title: "Customer Support Channel",
        col1Badge: "Vanilla JavaScript Chat",
        scenariosHeading: "Quick Scenario Test Harness:",
        scenariosHint: "Click any card to trigger",
        chatPlaceholder: "Ask about order status, refund, or address update...",
        sendBtn: "Send",
        col2Title: "ReAct Reasoning Engine",
        col2Subtitle: "Thought • Action Plan • Observation • Verification",
        stepCounterReady: "Ready",
        stepCounterCompleted: "Completed",
        stepModeLabel: "Step-by-Step Debugger Active",
        nextStepBtn: "Next Step",
        runAllBtn: "Run All",
        traceEmptyTitle: "Awaiting Trigger Query",
        traceEmptyDesc: "Select any scenario on the left or type an order question to watch ResolvAI reason, verify safety rules, and invoke tools.",
        tabDb: "Demo Data",
        tabArch: "Architecture",
        tabEval: "Guardrails",
        tableOrdersTitle: "Sample Orders",
        tableOrdersBadge: "MongoDB · Resolve_AI",
        tableLedgerTitle: "Demo Audit Ledger",
        tableLedgerBadge: "MongoDB audit history",
        thOrderId: "Order ID",
        thItem: "Item",
        thAmount: "Amount",
        thStatus: "Status",
        thAction: "Details",
        thTxId: "TxID",
        thTxOrder: "Order",
        thTxAmount: "Amount",
        thTxType: "Type",
        thTxStatus: "Status",
        welcomeMsg: "Hello! I am **ResolvAI**, a support-agent demo. Sample orders and audit entries are stored in the MongoDB `Resolve_AI` database. Refunds, tracking, and address updates are simulated; no real payment gateway or courier is connected. Try a scenario or type a demo order query!",
        toastLangSwitched: "Language switched to English",
        toastReset: "Demo data and audit ledger reset to their sample state",
        listenBtn: "🔊 Listen",
        stopAudioBtn: "⏹️ Stop",
        chipViewLedger: "💳 View in Ledger",
        chipCopyRef: "📋 Copy Ref ID",
        chipViewOrder: "📦 View Sample Order",
        copiedToast: "Copied to clipboard: ",
        footerAboutTitle: "About ResolvAI",
        footerAboutCopy: "A Homingo Hack Days 2026 Track 1 demonstration of an e-commerce support agent. It shows a five-stage ReAct workflow: understand a request, plan tools, check safety, simulate an action, and explain the result.",
        footerDemoTitle: "Demo scope",
        footerDemoCopy: "Built with HTML, CSS, JavaScript, Node.js, and MongoDB. Sample orders and audit entries persist in the Resolve_AI database. Refunds and courier tracking remain simulated; no real payment gateway or courier is connected.",
        footerSupportTitle: "Support",
        footerSupportCopy: "Try a preset scenario or review the guardrails to understand the demo. Use Reset Data to restore the sample orders.",
        footerSupportLink: "Open the support demo",
        footerContactTitle: "Contact",
        footerContactCopy: "Project: ResolvAI · Homingo Hack Days 2026 · Track 1: Agents (Planning, Tools & Safety). Contact the project team through the hackathon team channel; no public support email or phone is configured for this demo.",
        footerRights: "All rights reserved.",
        footerTop: "Back to top ↑"
      },
      hi: {
        agentTag: "रीएक्ट स्वायत्त एजेंट",
        stackTag: "MongoDB • Resolve_AI",
        headerSubtitle: "होमिंगो हैक डेज़ 2026 • ट्रैक: ऑटोनॉमस एजेंट्स (प्लानिंग, टूल्स और सेफ्टी)",
        modeAuto: "ऑटो रन",
        modeStep: "स्टेप-बाय-स्टेप",
        resetBtn: "डेटा रीसेट",
        modalBtn: "आर्किटेक्चर व रूब्रिक",
        phase1: "1. परसेप्शन (NLU)",
        phase2: "2. टूल प्लानिंग",
        phase3: "3. सुरक्षा गार्डरेल",
        phase4: "4. टूल निष्पादन",
        phase5: "5. समाधान",
        cycleTitle: "रीएक्ट चक्र:",
        navCycle: "रीएक्ट चक्र",
        navSupport: "ग्राहक सहायता",
        navEngine: "रीजनिंग इंजन",
        navData: "डेमो डेटा और सुरक्षा",
        navAbout: "परियोजना और संपर्क",
        col1Title: "ग्राहक सहायता चैट चैनल",
        col1Badge: "वेनिला JavaScript चैट",
        scenariosHeading: "त्वरित परिदृश्य टेस्ट हार्नेस:",
        scenariosHint: "चलाने के लिए कार्ड पर क्लिक करें",
        chatPlaceholder: "ऑर्डर स्थिति, रिफंड या पता बदलने के बारे में पूछें...",
        sendBtn: "भेजें",
        col2Title: "रीएक्ट रीजनिंग इंजन",
        col2Subtitle: "सोच • कार्य योजना • अवलोकन • सत्यापन",
        stepCounterReady: "तैयार",
        stepCounterCompleted: "पूर्ण",
        stepModeLabel: "स्टेप-बाय-स्टेप डीबगर सक्रिय",
        nextStepBtn: "अगला चरण",
        runAllBtn: "सभी चलाएं",
        traceEmptyTitle: "क्वेरी की प्रतीक्षा में",
        traceEmptyDesc: "बाईं ओर दिए गए परिदृश्यों में से किसी एक को चुनें या ऑर्डर संबंधित प्रश्न पूछें ताकि आप ResolvAI की विचार प्रक्रिया और टूल कॉल देख सकें।",
        tabDb: "डेमो डेटा",
        tabArch: "आर्किटेक्चर",
        tabEval: "सुरक्षा गार्डरेल्स",
        tableOrdersTitle: "नमूना ऑर्डर",
        tableOrdersBadge: "MongoDB · Resolve_AI",
        tableLedgerTitle: "डेमो ऑडिट लेज़र",
        tableLedgerBadge: "MongoDB ऑडिट इतिहास",
        thOrderId: "ऑर्डर आईडी",
        thItem: "वस्तु विवरण",
        thAmount: "राशि",
        thStatus: "स्थिति",
        thAction: "विवरण",
        thTxId: "लेनदेन आईडी",
        thTxOrder: "ऑर्डर",
        thTxAmount: "राशि",
        thTxType: "प्रकार",
        thTxStatus: "स्थिति",
        welcomeMsg: "नमस्ते! मैं **ResolvAI** सहायता एजेंट डेमो हूँ। नमूना ऑर्डर और ऑडिट रिकॉर्ड MongoDB के `Resolve_AI` डेटाबेस में सेव होते हैं। रिफंड, ट्रैकिंग और पता बदलने की प्रक्रिया सिम्युलेटेड है; कोई वास्तविक पेमेंट गेटवे या कूरियर जुड़ा नहीं है। कोई परिदृश्य चुनें या डेमो ऑर्डर के बारे में पूछें!",
        toastLangSwitched: "भाषा बदलकर हिन्दी कर दी गई है",
        toastReset: "डेमो डेटा और ऑडिट लेज़र नमूना स्थिति में रीसेट किए गए",
        listenBtn: "🔊 सुनें",
        stopAudioBtn: "⏹️ रोकें",
        chipViewLedger: "💳 लेज़र चेक करें",
        chipCopyRef: "📋 रेफरेंस कॉपी करें",
        chipViewOrder: "📦 नमूना ऑर्डर देखें",
        copiedToast: "क्लिपबोर्ड पर कॉपी किया गया: ",
        footerAboutTitle: "ResolvAI के बारे में",
        footerAboutCopy: "Homingo Hack Days 2026 के Track 1 के लिए ई-कॉमर्स सहायता एजेंट का प्रदर्शन। इसमें पाँच चरणों का ReAct वर्कफ़्लो दिखाया गया है: अनुरोध समझना, टूल योजना, सुरक्षा जांच, कार्रवाई का सिमुलेशन और परिणाम समझाना।",
        footerDemoTitle: "डेमो का दायरा",
        footerDemoCopy: "HTML, CSS, JavaScript, Node.js और MongoDB से बना। नमूना ऑर्डर और ऑडिट रिकॉर्ड Resolve_AI डेटाबेस में सेव होते हैं। रिफंड और कूरियर ट्रैकिंग सिम्युलेटेड हैं; कोई वास्तविक पेमेंट गेटवे या कूरियर जुड़ा नहीं है।",
        footerSupportTitle: "सहायता",
        footerSupportCopy: "डेमो समझने के लिए कोई उदाहरण चुनें या सुरक्षा नियम देखें। नमूना ऑर्डर बहाल करने के लिए डेटा रीसेट करें।",
        footerSupportLink: "सहायता डेमो खोलें",
        footerContactTitle: "संपर्क",
        footerContactCopy: "परियोजना: ResolvAI · Homingo Hack Days 2026 · Track 1: Agents (Planning, Tools & Safety)। हैकाथॉन टीम चैनल के माध्यम से परियोजना टीम से संपर्क करें; इस डेमो के लिए कोई सार्वजनिक सहायता ईमेल या फोन उपलब्ध नहीं है।",
        footerRights: "सर्वाधिकार सुरक्षित।",
        footerTop: "ऊपर जाएँ ↑"
      }
    };

    const scenarios = {
      p1: {
        titleEn: "boAt Headphone Broken",
        titleHi: "boAt हेडफ़ोन खराब / टूटा हुआ",
        badgeEn: "Auto-Refund",
        badgeHi: "तत्काल रिफंड",
        descEn: "ORD-8492: boAt Rockerz 450 (₹899). Broken ear cup.",
        descHi: "ORD-8492: boAt Rockerz 450 (₹899). दायां ईयरकप टूटा है।",
        queryEn: "Hi, I want a refund for my boAt Rockerz 450 headphones (Order #ORD-8492). The right ear cup is completely broken and crackling.",
        queryHi: "नमस्ते, मुझे boAt Rockerz 450 हेडफ़ोन (ऑर्डर #ORD-8492) के लिए रिफंड चाहिए। दायां ईयरकप पूरी तरह टूटा हुआ है और आवाज़ खराब आ रही है।"
      },
      p2: {
        titleEn: "Puma Sneakers Tracking",
        titleHi: "Puma स्नीकर्स डिलीवरी ट्रैकिंग",
        badgeEn: "Courier API",
        badgeHi: "कूरियर API",
        descEn: "ORD-3120: Puma Unisex Sneakers (₹2,499). Where is parcel?",
        descHi: "ORD-3120: Puma Sneakers (₹2,499). पार्सल कहाँ पहुंचा?",
        queryEn: "Where is my Puma sneakers package for order #ORD-3120? When will it reach Noida?",
        queryHi: "मेरा Puma स्नीकर्स का पार्सल (ऑर्डर #ORD-3120) अभी कहाँ है? यह नोएडा कब तक पहुंचेगा?"
      },
      p3: {
        titleEn: "Hostel Address Update",
        titleHi: "हॉस्टल डिलीवरी पता सुधार",
        badgeEn: "Safe Mutation",
        badgeHi: "सुरक्षित बदलाव",
        descEn: "ORD-9914: Processing stage. Change from hostel to Pune flat.",
        descHi: "ORD-9914: पैकेजिंग स्टेज में है। हॉस्टल की जगह पुणे फ्लैट का पता करें।",
        queryEn: "I accidentally put my old college hostel address on order #ORD-9914. Can you change delivery address to Flat 402, Hinjewadi Phase 1, Pune?",
        queryHi: "मैंने गलती से ऑर्डर #ORD-9914 में पुराना कॉलेज हॉस्टल का पता डाल दिया था। क्या आप पता बदलकर Flat 402, Hinjewadi Phase 1, Pune कर सकते हैं?"
      },
      p4: {
        titleEn: "Sony 4K TV Refund Edge Case",
        titleHi: "Sony 4K TV रिफंड (मानव समीक्षा)",
        badgeEn: "Human Escalation",
        badgeHi: "मानव एस्केलेशन",
        descEn: "ORD-5501: ₹54,990 TV refund. Guardrail blocks >₹2k auto limit.",
        descHi: "ORD-5501: ₹54,990 का टीवी रिफंड। सुरक्षा नियम ₹2k सीमा ब्लॉक करता है।",
        queryEn: "I want an immediate cash refund of ₹54,990 for my Sony 4K TV order #ORD-5501 without returning the box.",
        queryHi: "मुझे बिना बॉक्स वापस किए अपने Sony 4K TV ऑर्डर #ORD-5501 के लिए ₹54,990 का तुरंत नकद रिफंड चाहिए।"
      }
    };

    // DOM Elements
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const traceContainer = document.getElementById('trace-container');
    const tracePlaceholder = document.getElementById('trace-placeholder');
    const stepCounter = document.getElementById('step-counter');
    const stepControls = document.getElementById('step-controls');
    const btnNextStep = document.getElementById('btn-next-step');
    const btnRunAll = document.getElementById('btn-run-all');
    const ordersTableBody = document.getElementById('orders-table-body');
    const ledgerTableBody = document.getElementById('ledger-table-body');

    // Language Toggle Functionality
    function applyLanguage(lang) {
      currentLanguage = lang;
      const dict = i18n[lang];

      // Header & Badges
      document.getElementById('badge-agentTag' in dict ? 'badge-agentTag' : 'badge-agent-tag').textContent = dict.agentTag;
      document.getElementById('badge-stack-tag').innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ${dict.stackTag}`;
      updateDatabaseBadge(databaseConnected);
      document.getElementById('header-subtitle').textContent = dict.headerSubtitle;
      document.getElementById('label-mode-auto').textContent = dict.modeAuto;
      document.getElementById('label-mode-step').textContent = dict.modeStep;
      document.getElementById('label-reset-btn').textContent = dict.resetBtn;
      document.getElementById('label-modal-btn').textContent = dict.modalBtn;

      // ReAct 5-phase Bar
      document.getElementById('phase-txt-1').textContent = dict.phase1;
      document.getElementById('phase-txt-2').textContent = dict.phase2;
      document.getElementById('phase-txt-3').textContent = dict.phase3;
      document.getElementById('phase-txt-4').textContent = dict.phase4;
      document.getElementById('phase-txt-5').textContent = dict.phase5;
      document.getElementById('react-cycle-title').textContent = dict.cycleTitle;
      document.getElementById('nav-cycle').textContent = dict.navCycle;
      document.getElementById('nav-support').textContent = dict.navSupport;
      document.getElementById('nav-engine').textContent = dict.navEngine;
      document.getElementById('nav-data').textContent = dict.navData;
      document.getElementById('nav-about').textContent = dict.navAbout;

      // Col 1
      document.getElementById('col1-title').textContent = dict.col1Title;
      document.getElementById('col1-badge').textContent = dict.col1Badge;
      document.getElementById('scenarios-heading').innerHTML = `<span>🎯</span> <span>${dict.scenariosHeading}</span>`;
      document.getElementById('scenarios-hint').textContent = dict.scenariosHint;
      chatInput.placeholder = dict.chatPlaceholder;
      document.getElementById('label-send-btn').textContent = dict.sendBtn;

      // Scenario Cards
      for (let i = 1; i <= 4; i++) {
        const sc = scenarios['p' + i];
        document.getElementById(`preset-${i}-title`).textContent = lang === 'hi' ? sc.titleHi : sc.titleEn;
        document.getElementById(`preset-${i}-badge`).textContent = lang === 'hi' ? sc.badgeHi : sc.badgeEn;
        document.getElementById(`preset-${i}-desc`).textContent = lang === 'hi' ? sc.descHi : sc.descEn;
      }

      // Col 2
      document.getElementById('col2-title').textContent = dict.col2Title;
      document.getElementById('col2-subtitle').textContent = dict.col2Subtitle;
      if (!isProcessing && currentStepIndex === 0) {
        stepCounter.textContent = dict.stepCounterReady;
      } else if (!isProcessing && currentStepIndex > 0) {
        stepCounter.textContent = dict.stepCounterCompleted;
      }
      document.getElementById('step-mode-label').textContent = dict.stepModeLabel;
      document.getElementById('label-next-step').textContent = dict.nextStepBtn;
      document.getElementById('label-run-all').textContent = dict.runAllBtn;
      if (document.getElementById('trace-empty-title')) {
        document.getElementById('trace-empty-title').textContent = dict.traceEmptyTitle;
        document.getElementById('trace-empty-desc').textContent = dict.traceEmptyDesc;
      }

      // Col 3
      document.getElementById('label-tab-db').textContent = dict.tabDb;
      document.getElementById('label-tab-arch').textContent = dict.tabArch;
      document.getElementById('label-tab-eval').textContent = dict.tabEval;
      document.getElementById('table-orders-title').textContent = dict.tableOrdersTitle;
      document.getElementById('table-orders-badge').textContent = dict.tableOrdersBadge;
      document.getElementById('table-ledger-title').textContent = dict.tableLedgerTitle;
      document.getElementById('table-ledger-badge').textContent = dict.tableLedgerBadge;

      document.getElementById('th-orderid').textContent = dict.thOrderId;
      document.getElementById('th-item').textContent = dict.thItem;
      document.getElementById('th-amount').textContent = dict.thAmount;
      document.getElementById('th-status').textContent = dict.thStatus;
      document.getElementById('th-action').textContent = dict.thAction;

      document.getElementById('th-txid').textContent = dict.thTxId;
      document.getElementById('th-tx-order').textContent = dict.thTxOrder;
      document.getElementById('th-tx-amount').textContent = dict.thTxAmount;
      document.getElementById('th-tx-type').textContent = dict.thTxType;
      document.getElementById('th-tx-status').textContent = dict.thTxStatus;

      document.getElementById('footer-about-title').textContent = dict.footerAboutTitle;
      document.getElementById('footer-about-copy').textContent = dict.footerAboutCopy;
      document.getElementById('footer-demo-title').textContent = dict.footerDemoTitle;
      document.getElementById('footer-demo-copy').textContent = dict.footerDemoCopy;
      document.getElementById('footer-support-title').textContent = dict.footerSupportTitle;
      document.getElementById('footer-support-copy').textContent = dict.footerSupportCopy;
      document.getElementById('footer-support-link').textContent = dict.footerSupportLink;
      document.getElementById('footer-contact-title').textContent = dict.footerContactTitle;
      document.getElementById('footer-contact-copy').textContent = dict.footerContactCopy;
      document.getElementById('footer-rights-copy').textContent = dict.footerRights;
      document.getElementById('footer-top-link').textContent = dict.footerTop;
      document.getElementById('footer-year').textContent = new Date().getFullYear();

      // Update welcome message if present
      const welcomeCard = document.getElementById('welcome-message-body');
      if (welcomeCard) {
        welcomeCard.innerHTML = formatMarkdown(dict.welcomeMsg);
      }
      document.getElementById('modal-why-p1').innerHTML = currentLanguage === 'hi'
        ? 'ResolvAI <strong class="text-cyan-400">ReAct (Reasoning + Acting) वर्कफ़्लो</strong> दिखाता है। नमूना ऑर्डर और ऑडिट रिकॉर्ड MongoDB के <code>Resolve_AI</code> डेटाबेस में सेव होते हैं; बाहरी पेमेंट और कूरियर सेवाएँ सिम्युलेटेड हैं।'
        : 'ResolvAI demonstrates a <strong class="text-cyan-400">ReAct (Reasoning + Acting) workflow</strong>. Sample orders and audit entries persist in the MongoDB <code>Resolve_AI</code> database; external payment and courier services are simulated.';
      const welcomeTtsBtn = document.getElementById('welcome-tts-btn');
      if (welcomeTtsBtn) {
        welcomeTtsBtn.innerHTML = `<span>🔊</span> <span>${dict.listenBtn}</span>`;
      }

      // Toggle Button Styles
      const btnEn = document.getElementById('lang-en');
      const btnHi = document.getElementById('lang-hi');
      if (lang === 'en') {
        btnEn.className = 'px-2.5 py-1 rounded-md font-medium transition bg-cyan-600 text-white shadow-sm';
        btnHi.className = 'px-2.5 py-1 rounded-md font-medium text-slate-300 hover:text-white transition';
      } else {
        btnHi.className = 'px-2.5 py-1 rounded-md font-medium transition bg-cyan-600 text-white shadow-sm';
        btnEn.className = 'px-2.5 py-1 rounded-md font-medium text-slate-300 hover:text-white transition';
      }

      renderOrders();
      renderTransactions();
    }

    // Text To Speech (TTS) Helper
    function speakText(text, btnElement) {
      if (!('speechSynthesis' in window)) {
        showToast(currentLanguage === 'hi' ? 'आपका ब्राउज़र स्पीच सिंथेसिस सपोर्ट नहीं करता' : 'Web Speech API is not supported in this browser');
        return;
      }

      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        if (activeUtterance && activeUtterance.btnElement) {
          activeUtterance.btnElement.classList.remove('bg-rose-600', 'text-white');
          activeUtterance.btnElement.classList.add('bg-slate-800', 'text-slate-300');
          activeUtterance.btnElement.innerHTML = `<span>🔊</span> <span>${currentLanguage === 'hi' ? i18n.hi.listenBtn : i18n.en.listenBtn}</span>`;
        }
        if (activeUtterance && activeUtterance.btnElement === btnElement) {
          activeUtterance = null;
          return;
        }
      }

      // Clean markdown tags for natural speech
      const cleanText = text.replace(/[*_#`\[\]]/g, '').replace(/ORD-\d+/g, (m) => `Order ${m}`);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Select matching voice
      const voices = window.speechSynthesis.getVoices();
      if (currentLanguage === 'hi') {
        utterance.lang = 'hi-IN';
        const hiVoice = voices.find(v => v.lang.includes('hi') || v.name.includes('Hindi'));
        if (hiVoice) utterance.voice = hiVoice;
      } else {
        utterance.lang = 'en-IN';
        const enVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.includes('en-US'));
        if (enVoice) utterance.voice = enVoice;
      }

      utterance.btnElement = btnElement;
      activeUtterance = utterance;

      btnElement.classList.remove('bg-slate-800', 'text-slate-300');
      btnElement.classList.add('bg-rose-600', 'text-white');
      btnElement.innerHTML = `<span>⏹️</span> <span>${currentLanguage === 'hi' ? i18n.hi.stopAudioBtn : i18n.en.stopAudioBtn}</span>`;

      utterance.onend = () => {
        btnElement.classList.remove('bg-rose-600', 'text-white');
        btnElement.classList.add('bg-slate-800', 'text-slate-300');
        btnElement.innerHTML = `<span>🔊</span> <span>${currentLanguage === 'hi' ? i18n.hi.listenBtn : i18n.en.listenBtn}</span>`;
        activeUtterance = null;
      };

      utterance.onerror = () => {
        btnElement.classList.remove('bg-rose-600', 'text-white');
        btnElement.classList.add('bg-slate-800', 'text-slate-300');
        btnElement.innerHTML = `<span>🔊</span> <span>${currentLanguage === 'hi' ? i18n.hi.listenBtn : i18n.en.listenBtn}</span>`;
        activeUtterance = null;
      };

      window.speechSynthesis.speak(utterance);
    }

    // Clipboard copy helper
    function copyToClipboard(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          showToast((currentLanguage === 'hi' ? i18n.hi.copiedToast : i18n.en.copiedToast) + text);
        }).catch(() => {
          fallbackCopy(text);
        });
      } else {
        fallbackCopy(text);
      }
    }

    function fallbackCopy(text) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showToast((currentLanguage === 'hi' ? i18n.hi.copiedToast : i18n.en.copiedToast) + text);
      } catch (err) {
        showToast(text);
      }
      document.body.removeChild(ta);
    }

    // Markdown Parser (bold, code, links)
    function formatMarkdown(text) {
      if (!text) return '';
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-300 font-semibold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="text-slate-200">$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-slate-800 text-cyan-400 px-1 py-0.5 rounded text-[11px] font-mono">$1</code>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-cyan-400 underline hover:text-cyan-300">$1</a>');
    }

    // Render Database Tables
    function renderOrders(highlightOrderId = null) {
      ordersTableBody.innerHTML = '';
      liveOrders.forEach(o => {
        const tr = document.createElement('tr');
        tr.id = `row-order-${o.orderId}`;
        const isTarget = highlightOrderId === o.orderId;
        tr.className = `border-b border-slate-800/60 hover:bg-slate-850/60 transition ${isTarget ? 'bg-cyan-950/60 flash-updated' : ''}`;

        let statusBadge = 'bg-slate-800 text-slate-300';
        let statusLabel = o.status;
        if (o.status === 'Delivered') {
          statusBadge = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
          statusLabel = currentLanguage === 'hi' ? 'डिलीवर' : 'Delivered';
        } else if (o.status === 'Shipped') {
          statusBadge = 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
          statusLabel = currentLanguage === 'hi' ? 'मार्ग में (In Transit)' : 'Shipped';
        } else if (o.status === 'Processing') {
          statusBadge = 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
          statusLabel = currentLanguage === 'hi' ? 'पैकेजिंग (Processing)' : 'Processing';
        } else if (o.status === 'Refunded') {
          statusBadge = 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
          statusLabel = currentLanguage === 'hi' ? 'रिफंडेड' : 'Refunded';
        } else if (o.status === 'Escalated_To_Human') {
          statusBadge = 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
          statusLabel = currentLanguage === 'hi' ? 'मानव समीक्षा' : 'Escalated';
        }

        tr.innerHTML = `
          <td class="p-2 font-bold text-white">
            <span class="cursor-copy hover:text-cyan-300" title="Click to copy Order ID" onclick="copyToClipboard('${o.orderId}')">${o.orderId}</span>
          </td>
          <td class="p-2 max-w-[140px] truncate text-slate-300" title="${o.itemName}">${o.itemName}</td>
          <td class="p-2 text-slate-200">₹${o.amountINR.toLocaleString('en-IN')}</td>
          <td class="p-2"><span class="px-1.5 py-0.5 rounded text-[10px] ${statusBadge}">${statusLabel}</span></td>
          <td class="p-2 text-right">
            <button onclick="inspectOrderModal('${o.orderId}')" class="text-cyan-400 hover:text-cyan-300 text-[10px] underline font-sans">
              ${currentLanguage === 'hi' ? 'देखें' : 'View'}
            </button>
          </td>
        `;
        ordersTableBody.appendChild(tr);
      });
    }

    function renderTransactions(highlightTxId = null) {
      ledgerTableBody.innerHTML = '';
      auditLedger.forEach(tx => {
        const tr = document.createElement('tr');
        tr.id = `row-tx-${tx.txId}`;
        const isTarget = highlightTxId === tx.txId;
        tr.className = `border-b border-slate-800/60 hover:bg-slate-850/60 transition ${isTarget ? 'bg-cyan-950/60 flash-updated' : ''}`;

        let statusClass = 'text-emerald-400';
        if (tx.status === 'ESCALATED') statusClass = 'text-amber-400';

        tr.innerHTML = `
          <td class="p-2 font-mono text-cyan-400">
            <span class="cursor-copy hover:underline" title="Click to copy TxID" onclick="copyToClipboard('${tx.txId}')">${tx.txId}</span>
          </td>
          <td class="p-2 text-white font-mono">${tx.orderId}</td>
          <td class="p-2 text-slate-200 font-mono">₹${tx.amountINR.toLocaleString('en-IN')}</td>
          <td class="p-2 text-slate-300 text-[10px]">${tx.type}</td>
          <td class="p-2 ${statusClass} font-semibold text-[10px]">${tx.status}</td>
        `;
        ledgerTableBody.appendChild(tr);
      });
    }

    function inspectOrderModal(orderId) {
      const order = liveOrders.find(o => o.orderId === orderId);
      if (!order) return;
      showToast(`${order.orderId}: ${order.itemName} | Status: ${order.status}`);
    }

    // Reset Database to Initial State
    document.getElementById('btn-reset-db').addEventListener('click', async () => {
      if (!databaseConnected) {
        showToast('MongoDB is not connected. Data was not reset.');
        return;
      }

      try {
        await apiRequest('/api/reset', { method: 'POST' });
        await refreshDatabaseState();
        showToast(currentLanguage === 'hi' ? i18n.hi.toastReset : i18n.en.toastReset);
      } catch (error) {
        showToast(`Could not reset MongoDB data: ${error.message}`);
      }
    });

    // Chat Message Rendering
    function appendUserMessage(text) {
      const msgDiv = document.createElement('div');
      msgDiv.className = 'flex items-start gap-2.5 justify-end';
      msgDiv.innerHTML = `
        <div class="max-w-[85%] bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl rounded-tr-none px-3.5 py-2.5 shadow-md text-xs">
          <p class="leading-relaxed">${escapeHtml(text)}</p>
          <span class="block text-[9px] text-cyan-200 text-right mt-1 font-mono">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="w-7 h-7 rounded-full bg-cyan-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
          U
        </div>
      `;
      chatMessages.appendChild(msgDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function appendAgentMessage(text, meta = {}) {
      const msgDiv = document.createElement('div');
      msgDiv.className = 'flex items-start gap-2.5';
      const isWelcome = meta.isWelcome;

      let chipsHtml = '';
      if (meta.orderId) {
        const order = liveOrders.find(o => o.orderId === meta.orderId);
        const orderIdText = meta.orderId;
        const txIdText = meta.txId || '';

        const chipLedgerText = currentLanguage === 'hi' ? i18n.hi.chipViewLedger : i18n.en.chipViewLedger;
        const chipOrderText = currentLanguage === 'hi' ? i18n.hi.chipViewOrder : i18n.en.chipViewOrder;
        const chipCopyText = currentLanguage === 'hi' ? i18n.hi.chipCopyRef : i18n.en.chipCopyRef;

        chipsHtml = `
          <div class="mt-2.5 pt-2 border-t border-slate-700/60 flex flex-wrap gap-1.5 text-[10px]">
            <button onclick="focusTab('db', '${orderIdText}')" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition flex items-center gap-1">
              <span>🗄️</span> <span>${chipOrderText}</span>
            </button>
            ${txIdText ? `
              <button onclick="focusTab('ledger', '${txIdText}')" class="px-2 py-0.5 rounded bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/80 transition flex items-center gap-1">
                <span>💳</span> <span>${chipLedgerText}</span>
              </button>
              <button onclick="copyToClipboard('${txIdText}')" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1">
                <span>📋</span> <span>${chipCopyText}</span>
              </button>
            ` : ''}
          </div>
        `;
      }

      const ttsBtnId = 'tts-' + Math.random().toString(36).substring(2, 9);
      const listenLabel = currentLanguage === 'hi' ? i18n.hi.listenBtn : i18n.en.listenBtn;

      msgDiv.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-slate-800 border border-cyan-500/40 overflow-hidden flex-shrink-0">
          <img src="assets/agent-avatar.jpg" alt="ResolvAI" class="w-full h-full object-cover">
        </div>
        <div class="max-w-[88%] bg-slate-850 border border-slate-800 text-slate-100 rounded-2xl rounded-tl-none px-3.5 py-2.5 shadow-md text-xs relative group">
          <div class="flex items-center justify-between mb-1">
            <span class="font-bold text-cyan-400 text-[11px] flex items-center gap-1">
              ResolvAI 
              ${meta.guardrailPassed !== undefined ? `<span class="text-[9px] px-1 py-0.2 rounded ${meta.guardrailPassed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'} font-mono">${meta.guardrailPassed ? 'SAFE' : 'ESCALATED'}</span>` : ''}
            </span>
            <!-- Text to Speech Button -->
            <button id="${ttsBtnId}" class="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition flex items-center gap-1" title="Read message aloud">
              <span>🔊</span> <span>${listenLabel}</span>
            </button>
          </div>
          <div class="leading-relaxed text-slate-200">
            ${formatMarkdown(text)}
          </div>
          ${chipsHtml}
          <span class="block text-[9px] text-slate-500 text-right mt-1 font-mono">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      `;

      chatMessages.appendChild(msgDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Attach TTS click handler
      const ttsBtn = document.getElementById(ttsBtnId);
      if (ttsBtn) {
        ttsBtn.addEventListener('click', () => {
          speakText(text, ttsBtn);
        });
      }
    }

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function focusTab(target, itemId) {
      selectTab(tabDb, contentDb);
      if (target === 'db') {
        renderOrders(itemId);
        const row = document.getElementById(`row-order-${itemId}`);
        if (row) row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else if (target === 'ledger') {
        renderTransactions(itemId);
        const row = document.getElementById(`row-tx-${itemId}`);
        if (row) row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    // Stepper & ReAct Visualization
    function setPhaseActive(phaseNum) {
      for (let i = 1; i <= 5; i++) {
        const el = document.getElementById(`phase-badge-${i}`);
        if (!el) continue;
        if (i < phaseNum) {
          el.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-700/80 transition';
          el.children[0].className = 'w-1.5 h-1.5 rounded-full bg-emerald-400';
        } else if (i === phaseNum) {
          el.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-600 text-white border border-cyan-400 font-bold animate-pulse transition';
          el.children[0].className = 'w-1.5 h-1.5 rounded-full bg-white';
        } else {
          el.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/60 transition';
          el.children[0].className = 'w-1.5 h-1.5 rounded-full bg-slate-500';
        }
      }
    }

    function renderStep(step) {
      if (tracePlaceholder && tracePlaceholder.parentElement) {
        tracePlaceholder.remove();
      }

      const card = document.createElement('div');
      card.className = 'p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 shadow-sm text-xs border-l-4 border-l-cyan-500 animate-fadeIn';

      let phaseBadgeColor = 'bg-cyan-950 text-cyan-400 border border-cyan-800';
      if (step.phase === 'SAFETY_CHECK') phaseBadgeColor = step.passed ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800';
      if (step.phase === 'TOOL_EXEC') phaseBadgeColor = 'bg-purple-950 text-purple-400 border border-purple-800';
      if (step.phase === 'SYNTHESIS') phaseBadgeColor = 'bg-blue-950 text-blue-400 border border-blue-800';

      const stepTitle = currentLanguage === 'hi' ? (step.titleHi || step.title) : step.title;
      const stepThought = currentLanguage === 'hi' ? (step.thoughtHi || step.thought) : step.thought;

      let detailsHtml = '';
      if (stepThought) {
        detailsHtml += `
        <div class="p-2 bg-slate-950/80 rounded-lg border border-slate-800 text-slate-300 font-mono text-[11px] leading-relaxed">
          <span class="text-cyan-400 font-bold block mb-0.5">${currentLanguage === 'hi' ? '🤔 विचार (Thought):' : '🤔 Thought Process:'}</span>
          ${stepThought}
        </div>`;
      }

      if (step.toolCall) {
        detailsHtml += `
        <div class="p-2 bg-slate-950/80 rounded-lg border border-purple-900/50 text-[11px] font-mono">
          <div class="flex items-center justify-between text-purple-300 font-bold mb-1">
            <span>⚙️ ${currentLanguage === 'hi' ? 'टूल निष्पादन:' : 'Invoking Tool:'} <code class="text-white">${step.toolCall.name}</code></span>
            <span class="text-[9px] px-1.5 py-0.2 rounded bg-purple-900/50 text-purple-200">Async Webhook</span>
          </div>
          <pre class="text-[10px] text-purple-200 overflow-x-auto">${JSON.stringify(step.toolCall.params, null, 2)}</pre>
        </div>`;
      }

      if (step.policyCheck) {
        const passText = currentLanguage === 'hi' ? 'पास (स्वीकृत)' : 'PASSED';
        const failText = currentLanguage === 'hi' ? 'एस्केलेट (रोका गया)' : 'POLICY_VIOLATION';
        detailsHtml += `
        <div class="p-2 bg-slate-950/80 rounded-lg border ${step.policyCheck.passed ? 'border-emerald-800/80' : 'border-rose-800/80'} text-[11px] font-mono">
          <div class="flex items-center justify-between font-bold mb-1 ${step.policyCheck.passed ? 'text-emerald-400' : 'text-rose-400'}">
            <span>🛡️ ${currentLanguage === 'hi' ? 'सुरक्षा नियम जांच:' : 'Guardrail Verification:'} ${step.policyCheck.ruleName}</span>
            <span class="text-[9px] px-1.5 py-0.2 rounded ${step.policyCheck.passed ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'} font-bold">
              ${step.policyCheck.passed ? passText : failText}
            </span>
          </div>
          <p class="text-[10px] text-slate-300">${currentLanguage === 'hi' ? (step.policyCheck.reasonHi || step.policyCheck.reason) : step.policyCheck.reason}</p>
        </div>`;
      }

      if (step.observation) {
        detailsHtml += `
        <div class="p-2 bg-slate-950/80 rounded-lg border border-emerald-900/50 text-[11px] font-mono">
          <span class="text-emerald-400 font-bold block mb-1">🔍 ${currentLanguage === 'hi' ? 'अवलोकन (Observation):' : 'Tool Observation:'}</span>
          <pre class="text-[10px] text-emerald-200 overflow-x-auto">${typeof step.observation === 'object' ? JSON.stringify(step.observation, null, 2) : step.observation}</pre>
        </div>`;
      }

      card.innerHTML = `
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold text-white font-mono">${currentLanguage === 'hi' ? 'चरण' : 'Step'} ${step.stepNumber}: ${stepTitle}</span>
          <span class="px-2 py-0.5 text-[10px] font-mono rounded-md ${phaseBadgeColor}">${step.phase}</span>
        </div>
        ${detailsHtml}
      `;

      traceContainer.appendChild(card);
      traceContainer.scrollTop = traceContainer.scrollHeight;
    }

    function finishExecution() {
      isProcessing = false;
      stepCounter.textContent = currentLanguage === 'hi' ? i18n.hi.stepCounterCompleted : i18n.en.stepCounterCompleted;
      stepCounter.className = 'text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded';
      setPhaseActive(6);
    }

    // Step-by-step controller
    async function executeNextStep() {
      if (currentStepIndex >= currentTraceSteps.length) {
        finishExecution();
        return;
      }

      const step = currentTraceSteps[currentStepIndex];
      stepCounter.textContent = `${currentLanguage === 'hi' ? 'चरण' : 'Step'} ${step.stepNumber}/${currentTraceSteps.length}`;
      setPhaseActive(step.phaseNumber);
      renderStep(step);

      if (step.mutations) {
        try {
          await step.mutations();
        } catch (error) {
          isProcessing = false;
          stepCounter.textContent = currentLanguage === 'hi' ? 'डेटाबेस सेव विफल' : 'Database save failed';
          showToast(`Could not save changes to MongoDB: ${error.message}`);
          try {
            await refreshDatabaseState();
          } catch (refreshError) {
            databaseConnected = false;
            updateDatabaseBadge(false);
            const loadError = document.getElementById('section-load-error');
            loadError.textContent = `MongoDB could not be refreshed after a failed save. ${refreshError.message}`;
            loadError.classList.remove('hidden');
          }
          return;
        }
      }

      if (currentStepIndex === currentTraceSteps.length - 1) {
        const finalMsg = currentLanguage === 'hi' ? step.finalReplyHi : step.finalReplyEn;
        appendAgentMessage(finalMsg, { orderId: step.orderId, txId: step.txId, guardrailPassed: step.guardrailPassed });
      }

      currentStepIndex++;
      if (currentStepIndex >= currentTraceSteps.length) {
        finishExecution();
      }
    }

    async function runAutoTrace() {
      while (currentStepIndex < currentTraceSteps.length) {
        await executeNextStep();
        if (!isProcessing && currentStepIndex < currentTraceSteps.length) return;
        if (currentStepIndex < currentTraceSteps.length) {
          await new Promise(r => setTimeout(r, 600));
        }
      }
    }

    // Agent ReAct Solver Logic (Bilingual NLU + Tool Plan + Guardrail)
    function processUserQuery(queryText) {
      if (!databaseConnected) {
        showToast('MongoDB is not connected. Start the server before running a scenario.');
        return;
      }
      if (isProcessing) return;
      isProcessing = true;

      traceContainer.innerHTML = '';
      currentTraceSteps = [];
      currentStepIndex = 0;

      stepCounter.textContent = currentLanguage === 'hi' ? 'विश्लेषण...' : 'Analyzing...';
      stepCounter.className = 'text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2 py-0.5 rounded';

      appendUserMessage(queryText);

      // Parse Order Entities
      const match = queryText.match(/ORD-\d+/i);
      const orderId = match ? match[0].toUpperCase() : null;
      const lower = queryText.toLowerCase();

      let targetOrder = orderId ? liveOrders.find(o => o.orderId === orderId) : null;

      // Robust Hindi + English NLU Intent Detection
      let detectedIntent = 'GENERAL_INQUIRY';
      const isRefundIntent = lower.includes('refund') || lower.includes('broken') || lower.includes('damage') || lower.includes('return') || lower.includes('money back') ||
                            lower.includes('रिफंड') || lower.includes('पैसे') || lower.includes('वापस') || lower.includes('खराब') || lower.includes('टूटा') || lower.includes('टूटी') || lower.includes('नुकसान');

      const isTrackingIntent = lower.includes('where') || lower.includes('track') || lower.includes('status') || lower.includes('arrive') || lower.includes('delivery') || lower.includes('reach') ||
                               lower.includes('कहाँ') || lower.includes('ट्रैक') || lower.includes('कब') || lower.includes('पहुंचेगा') || lower.includes('स्थिति') || lower.includes('पार्सल');

      const isAddressIntent = lower.includes('address') || lower.includes('hostel') || lower.includes('change') || lower.includes('deliver to') ||
                              lower.includes('पता') || lower.includes('एड्रेस') || lower.includes('बदलो') || lower.includes('बदलना') || lower.includes('हॉस्टल') || lower.includes('फ्लैट');

      if (isRefundIntent) {
        detectedIntent = 'REFUND_REQUEST';
      } else if (isAddressIntent) {
        detectedIntent = 'ADDRESS_UPDATE';
      } else if (isTrackingIntent) {
        detectedIntent = 'TRACKING_INQUIRY';
      }

      // Step 1: Perception
      currentTraceSteps.push({
        stepNumber: 1,
        phaseNumber: 1,
        phase: 'PERCEPTION',
        title: 'NLU Intent & Entity Extraction',
        titleHi: 'NLU आशय (Intent) और इकाई पहचान',
        thought: `Customer query received. Intent identified as '${detectedIntent}'. Entity: ${orderId || 'None detected'}.`,
        thoughtHi: `ग्राहक क्वेरी प्राप्त हुई। पहचाना गया आशय: '${detectedIntent}'। इकाई (Entity): ${orderId || 'कोई नहीं'}।`,
        observation: { intent: detectedIntent, extractedOrderId: orderId }
      });

      if (!orderId || !targetOrder) {
        currentTraceSteps.push({
          stepNumber: 2,
          phaseNumber: 2,
          phase: 'SYNTHESIS',
          title: 'Entity Clarification Required',
          titleHi: 'ऑर्डर आईडी स्पष्टीकरण आवश्यक',
          thought: 'No valid order matching in MongoDB collections. Requesting specific Order ID.',
          thoughtHi: 'मोंगोडीबी में कोई मान्य ऑर्डर नहीं मिला। ग्राहक से वैध ऑर्डर आईडी मांगी जा रही है।',
          finalReplyEn: `I couldn't locate a valid Order ID (e.g., #ORD-8492) in your request. Could you please provide your 7-character order reference number so I can pull your records safely?`,
          finalReplyHi: `मुझे आपके अनुरोध में कोई मान्य ऑर्डर आईडी (जैसे #ORD-8492) नहीं मिली। कृपया अपना 7-अंकीय ऑर्डर नंबर साझा करें ताकि मैं मोंगोडीबी रिकॉर्ड्स सुरक्षित रूप से देख सकूं।`,
          guardrailPassed: true
        });
        startExecution();
        return;
      }

      // SCENARIO A: REFUND REQUEST
      if (detectedIntent === 'REFUND_REQUEST') {
        currentTraceSteps.push({
          stepNumber: 2,
          phaseNumber: 2,
          phase: 'TOOL_PLAN',
          title: 'Query MongoDB Order Record',
          titleHi: 'मोंगोडीबी ऑर्डर रिकॉर्ड खोज',
          thought: `Fetching order '${targetOrder.orderId}' from MongoDB collection 'orders'. Checking delivered status and price.`,
          thoughtHi: `कलेक्शन 'orders' से ऑर्डर '${targetOrder.orderId}' खोजा जा रहा है। डिलीवरी स्थिति और राशि जांची जा रही है।`,
          toolCall: {
            name: 'mongoDB.orders.findOne',
            params: { orderId: targetOrder.orderId }
          },
          observation: {
            orderId: targetOrder.orderId,
            item: targetOrder.itemName,
            amountINR: targetOrder.amountINR,
            status: targetOrder.status,
            customer: targetOrder.customerName
          }
        });

        // Step 3: Safety Guardrail Check
        const isAutonomousAllowed = targetOrder.amountINR <= AUTO_REFUND_LIMIT;
        currentTraceSteps.push({
          stepNumber: 3,
          phaseNumber: 3,
          phase: 'SAFETY_CHECK',
          title: 'Deterministic Guardrail: Autonomous Refund Cap (₹2,000)',
          titleHi: 'सुरक्षा गार्डरेल: स्वायत्त रिफंड सीमा (₹2,000)',
          thought: isAutonomousAllowed 
            ? `Order amount ₹${targetOrder.amountINR} is within the safe autonomous cap (≤ ₹${AUTO_REFUND_LIMIT}). Proceeding with automated payout.`
            : `Order amount ₹${targetOrder.amountINR} exceeds autonomous limit (₹${AUTO_REFUND_LIMIT}). High-value financial safety rule triggered. Escalating to human supervisor.`,
          thoughtHi: isAutonomousAllowed
            ? `ऑर्डर राशि ₹${targetOrder.amountINR} सुरक्षित स्वायत्त सीमा (≤ ₹${AUTO_REFUND_LIMIT}) के भीतर है। ऑटोमैटिक रिफंड की अनुमति है।`
            : `ऑर्डर राशि ₹${targetOrder.amountINR} स्वायत्त सीमा (₹${AUTO_REFUND_LIMIT}) से अधिक है। वित्तीय सुरक्षा गार्डरेल सक्रिय! वरिष्ठ सुपरवाइज़र को भेजा जा रहा है।`,
          passed: isAutonomousAllowed,
          policyCheck: {
            ruleName: 'MAX_AUTONOMOUS_REFUND_INR_2000',
            passed: isAutonomousAllowed,
            reason: isAutonomousAllowed
              ? `Amount ₹${targetOrder.amountINR} <= ₹${AUTO_REFUND_LIMIT}. Autonomous execution authorized.`
              : `Amount ₹${targetOrder.amountINR} exceeds autonomous limit (₹${AUTO_REFUND_LIMIT}). Unauthorized for automated execution.`,
            reasonHi: isAutonomousAllowed
              ? `राशि ₹${targetOrder.amountINR} <= ₹${AUTO_REFUND_LIMIT}। स्वायत्त रिफंड अधिकृत।`
              : `राशि ₹${targetOrder.amountINR} सीमा (₹${AUTO_REFUND_LIMIT}) से अधिक है। स्वचालित निष्पादन वर्जित।`
          }
        });

        if (isAutonomousAllowed) {
          const generatedTxId = `TXN-REF-${Math.floor(100000 + Math.random() * 900000)}`;

          currentTraceSteps.push({
            stepNumber: 4,
            phaseNumber: 4,
            phase: 'TOOL_EXEC',
            title: 'Invoke Razorpay Refund API & Write Audit Ledger',
            titleHi: 'रेज़रपे रिफंड API और मोंगोडीबी ऑडिट लेज़र लेखन',
            thought: `Triggering Payment Gateway Refund API and committing transaction record to collection 'audit_ledger'.`,
            thoughtHi: `पेमेंट गेटवे रिफंड API कॉल किया जा रहा है और 'audit_ledger' में लेनदेन दर्ज किया जा रहा है।`,
            toolCall: {
              name: 'paymentGateway.refundTransaction',
              params: {
                orderId: targetOrder.orderId,
                amountINR: targetOrder.amountINR,
                reason: 'DEFECTIVE_PRODUCT_REPORTED'
              }
            },
            mutations: async () => {
              const transaction = {
                txId: generatedTxId,
                orderId: targetOrder.orderId,
                amountINR: targetOrder.amountINR,
                type: 'REFUND_AUTONOMOUS',
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                status: 'SUCCESS'
              };
              await apiRequest('/api/operations', {
                method: 'POST',
                body: JSON.stringify({
                  orderId: targetOrder.orderId,
                  updates: { status: 'Refunded' },
                  transaction
                })
              });
              targetOrder.status = 'Refunded';
              auditLedger.unshift(transaction);
              renderOrders(targetOrder.orderId);
              renderTransactions(generatedTxId);
            },
            observation: {
              transactionId: generatedTxId,
              status: 'PROCESSED',
              settlementEtaHours: 24
            }
          });

          currentTraceSteps.push({
            stepNumber: 5,
            phaseNumber: 5,
            phase: 'SYNTHESIS',
            title: 'Synthesize Safe Customer Resolution',
            titleHi: 'ग्राहक समाधान विवरण तैयार करना',
            thought: 'All safety invariants satisfied. Providing customer with immediate confirmation and transaction reference.',
            thoughtHi: 'सभी सुरक्षा नियम संतुष्ट हैं। ग्राहक को तुरंत पुष्टि और लेनदेन संदर्भ संख्या प्रदान की जा रही है।',
            finalReplyEn: `I have verified your purchase for order **#${targetOrder.orderId}** (${targetOrder.itemName}). Because the item arrived damaged and qualifies under our 7-day guarantee, I have automatically issued an immediate refund of **₹${targetOrder.amountINR.toLocaleString('en-IN')}** to your original payment method.

• **Transaction ID:** \`${generatedTxId}\`
• **Settlement ETA:** 24 hours
• **Status:** Successfully updated in our system. You do not need to ship the damaged unit back.`,
            finalReplyHi: `मैंने आपके ऑर्डर **#${targetOrder.orderId}** (${targetOrder.itemName}) के रिकॉर्ड्स सत्यापित कर लिए हैं। चूंकि पार्सल क्षतिग्रस्त स्थिति में मिला है और यह हमारी 7-दिवसीय गारंटी नीति के अंतर्गत आता है, मैंने आपके मूल भुगतान खाते में **₹${targetOrder.amountINR.toLocaleString('en-IN')}** का पूर्ण रिफंड जारी कर दिया है।

• **लेनदेन संदर्भ (TxID):** \`${generatedTxId}\`
• **पैसे आने की समय सीमा:** 24 घंटे
• **स्थिति:** मोंगोडीबी में रिफंड दर्ज हो चुका है। आपको क्षतिग्रस्त हेडफ़ोन वापस भेजने की आवश्यकता नहीं है।`,
            orderId: targetOrder.orderId,
            txId: generatedTxId,
            guardrailPassed: true
          });
        } else {
          // Escalation path for high-value orders
          const ticketId = `CASE-ESC-${Math.floor(1000 + Math.random() * 9000)}`;

          currentTraceSteps.push({
            stepNumber: 4,
            phaseNumber: 4,
            phase: 'TOOL_EXEC',
            title: 'Queue Human Escalation Ticket in CRM',
            titleHi: 'CRM में मानव समीक्षा टिकट जोड़ना',
            thought: `Routing dispute to Senior Tier-2 Support Queue. Updating order status to 'Escalated_To_Human'.`,
            thoughtHi: `विवाद को वरिष्ठ सुपरवाइज़र सहायता डेस्क पर भेजा जा रहा है। ऑर्डर स्थिति 'Escalated_To_Human' की गई।`,
            toolCall: {
              name: 'crm.escalations.createTicket',
              params: {
                orderId: targetOrder.orderId,
                amountINR: targetOrder.amountINR,
                reason: 'AMOUNT_EXCEEDS_AUTONOMOUS_LIMIT',
                queue: 'Senior Supervisor Support Desk'
              }
            },
            mutations: async () => {
              const transaction = {
                txId: ticketId,
                orderId: targetOrder.orderId,
                amountINR: targetOrder.amountINR,
                type: 'ESCALATION_QUEUE',
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                status: 'ESCALATED'
              };
              await apiRequest('/api/operations', {
                method: 'POST',
                body: JSON.stringify({
                  orderId: targetOrder.orderId,
                  updates: { status: 'Escalated_To_Human' },
                  transaction
                })
              });
              targetOrder.status = 'Escalated_To_Human';
              auditLedger.unshift(transaction);
              renderOrders(targetOrder.orderId);
              renderTransactions(ticketId);
            },
            observation: {
              ticketNumber: ticketId,
              assignedDepartment: 'Tier-2 High Value Resolutions',
              slaCallbackHours: 2
            }
          });

          currentTraceSteps.push({
            stepNumber: 5,
            phaseNumber: 5,
            phase: 'SYNTHESIS',
            title: 'Synthesize Safe Escalation Communication',
            titleHi: 'एस्केलेशन सूचना तैयार करना',
            thought: 'Explaining safety policy politely and communicating expected callback window.',
            thoughtHi: 'सुरक्षा नियम समझाते हुए ग्राहक को सहायता डेस्क के संपर्क समय की जानकारी देना।',
            finalReplyEn: `For order **#${targetOrder.orderId}** (${targetOrder.itemName}), refund requests for high-value items (**₹${targetOrder.amountINR.toLocaleString('en-IN')}**) require mandatory manual inspection by a Senior Support Specialist under our safety guidelines.

• **Escalation Case ID:** \`${ticketId}\`
• **Action:** Assigned with Priority 1 to our Bengaluru escalations desk.
• **Callback SLA:** A supervisor will review the case and contact you within 2 hours at \`${targetOrder.email}\`.`,
            finalReplyHi: `ऑर्डर **#${targetOrder.orderId}** (${targetOrder.itemName}) के लिए, उच्च-मूल्य की वस्तुओं (**₹${targetOrder.amountINR.toLocaleString('en-IN')}**) पर रिफंड के लिए हमारे सुरक्षा नियमों के तहत वरिष्ठ अधिकारी की समीक्षा अनिवार्य है।

• **एस्केलेशन केस आईडी:** \`${ticketId}\`
• **कार्रवाई:** प्राथमिकता-1 के साथ बेंगलुरु सहायता डेस्क को सौंपा गया।
• **संपर्क समय:** एक वरिष्ठ अधिकारी 2 घंटे के भीतर आपसे \`${targetOrder.email}\` पर संपर्क करेंगे।`,
            orderId: targetOrder.orderId,
            txId: ticketId,
            guardrailPassed: false
          });
        }
      }

      // SCENARIO B: TRACKING INQUIRY
      else if (detectedIntent === 'TRACKING_INQUIRY') {
        currentTraceSteps.push({
          stepNumber: 2,
          phaseNumber: 2,
          phase: 'TOOL_PLAN',
          title: 'Query Logistics Courier Gateway',
          titleHi: 'कूरियर लॉजिस्टिक्स गेटवे खोज',
          thought: `Querying courier partner '${targetOrder.carrier}' with tracking reference '${targetOrder.trackingId}'.`,
          thoughtHi: `कूरियर पार्टनर '${targetOrder.carrier}' से ट्रैकिंग रेफरेंस '${targetOrder.trackingId}' की ताज़ा स्थिति ली जा रही है।`,
          toolCall: {
            name: 'courierGateway.getTrackingTimeline',
            params: {
              carrier: targetOrder.carrier,
              trackingId: targetOrder.trackingId,
              orderId: targetOrder.orderId
            }
          },
          observation: {
            carrier: targetOrder.carrier,
            trackingId: targetOrder.trackingId,
            currentLocation: "Gurugram Distribution Hub",
            destinationCity: "Noida, UP",
            status: "IN_TRANSIT",
            estimatedDelivery: "Tomorrow by 2:00 PM IST"
          }
        });

        currentTraceSteps.push({
          stepNumber: 3,
          phaseNumber: 3,
          phase: 'SAFETY_CHECK',
          title: 'Verify Grounded Logistics Coordinates',
          titleHi: 'लॉजिस्टिक्स डेटा प्रामाणिकता जांच',
          thought: 'Verifying courier response matches customer delivery address in MongoDB.',
          thoughtHi: 'सत्यापित किया जा रहा है कि कूरियर डेटा मोंगोडीबी में ग्राहक के पते से मेल खाता है।',
          passed: true,
          policyCheck: {
            ruleName: 'GROUNDED_LOCATION_VERIFICATION',
            passed: true,
            reason: `Grounded coordinates validated against destination: ${targetOrder.shippingAddress}.`,
            reasonHi: `गंतव्य पते के साथ डिलीवरी डेटा सत्यापित: ${targetOrder.shippingAddress}।`
          }
        });

        currentTraceSteps.push({
          stepNumber: 4,
          phaseNumber: 5,
          phase: 'SYNTHESIS',
          title: 'Generate Grounded Tracking Update',
          titleHi: 'लाइव ट्रैकिंग सारांश तैयार करना',
          thought: 'Formatting clear tracking status with courier link and expected delivery time.',
          thoughtHi: 'स्पष्ट डिलीवरी स्थिति और आगमन समय ग्राहक को प्रस्तुत करना।',
          finalReplyEn: `Here is the live logistics status for order **#${targetOrder.orderId}** (${targetOrder.itemName}):

• **Status:** In Transit with **${targetOrder.carrier}**
• **Current Location:** Gurugram Distribution Hub (Departed sorting center)
• **Destination Address:** ${targetOrder.shippingAddress}
• **Tracking Number:** \`${targetOrder.trackingId}\`
• **Expected Delivery:** Tomorrow by 2:00 PM IST.`,
          finalReplyHi: `ऑर्डर **#${targetOrder.orderId}** (${targetOrder.itemName}) की लाइव ट्रैकिंग स्थिति:

• **कूरियर स्थिति:** **${targetOrder.carrier}** के साथ मार्ग में (In Transit)
• **वर्तमान स्थान:** गुरुग्राम हब (सॉर्टिंग सेंटर से रवाना हो चुका है)
• **डिलीवरी पता:** ${targetOrder.shippingAddress}
• **ट्रैकिंग नंबर:** \`${targetOrder.trackingId}\`
• **अनुमानित आगमन:** कल दोपहर 2:00 बजे तक।`,
          orderId: targetOrder.orderId,
          txId: targetOrder.trackingId,
          guardrailPassed: true
        });
      }

      // SCENARIO C: ADDRESS UPDATE
      else if (detectedIntent === 'ADDRESS_UPDATE') {
        const canEditAddress = targetOrder.status === 'Processing';
        const newAddress = "Flat 402, Hinjewadi Phase 1, Pune";

        currentTraceSteps.push({
          stepNumber: 2,
          phaseNumber: 2,
          phase: 'TOOL_PLAN',
          title: 'Check Dispatch Stage in MongoDB',
          titleHi: 'मोंगोडीबी में डिस्पैच स्टेज जांच',
          thought: `Checking if order '${targetOrder.orderId}' has been dispatched. Status is currently '${targetOrder.status}'.`,
          thoughtHi: `जांचा जा रहा है कि क्या ऑर्डर '${targetOrder.orderId}' कूरियर को सौंपा जा चुका है। वर्तमान स्थिति: '${targetOrder.status}'।`,
          toolCall: {
            name: 'mongoDB.orders.getStatus',
            params: { orderId: targetOrder.orderId }
          },
          observation: {
            orderId: targetOrder.orderId,
            currentStatus: targetOrder.status,
            currentAddress: targetOrder.shippingAddress
          }
        });

        currentTraceSteps.push({
          stepNumber: 3,
          phaseNumber: 3,
          phase: 'SAFETY_CHECK',
          title: 'Guardrail: Logistics Transit Freeze Rule',
          titleHi: 'सुरक्षा नियम: लॉजिस्टिक्स ट्रांजिट फ्रीज़ नियम',
          thought: canEditAddress 
            ? 'Order is still in packaging stage. Address mutation permitted.' 
            : `Order is already in '${targetOrder.status}' stage. Address mutation strictly forbidden by courier SLA policy.`,
          thoughtHi: canEditAddress
            ? 'ऑर्डर अभी भी पैकेजिंग (Processing) स्टेज में है। पता बदलने की अनुमति है।'
            : `ऑर्डर पहले ही '${targetOrder.status}' स्टेज पर है। कूरियर नीति के अनुसार पता बदलना पूर्णतः वर्जित है।`,
          passed: canEditAddress,
          policyCheck: {
            ruleName: 'SHIPPING_MUTATION_RESTRICTED_TO_PRE_DISPATCH',
            passed: canEditAddress,
            reason: canEditAddress 
              ? 'Status is Processing (pre-dispatch). Safe to mutate.' 
              : `Status '${targetOrder.status}' is immutable once courier pickup occurs.`,
            reasonHi: canEditAddress
              ? 'स्थिति अभी Processing (डिस्पैच से पूर्व) है। पता बदलना सुरक्षित है।'
              : `स्थिति '${targetOrder.status}' कूरियर को सौंपे जाने के बाद अपरिवर्तनीय है।`
          }
        });

        if (canEditAddress) {
          currentTraceSteps.push({
            stepNumber: 4,
            phaseNumber: 4,
            phase: 'TOOL_EXEC',
            title: 'Mutate MongoDB Shipping Document',
            titleHi: 'मोंगोडीबी शिपिंग दस्तावेज़ में पता अपडेट',
            thought: `Updating delivery address in MongoDB document to '${newAddress}'. Writing audit trace.`,
            thoughtHi: `मोंगोडीबी में डिलीवरी पता बदलकर '${newAddress}' किया जा रहा है।`,
            toolCall: {
              name: 'mongoDB.orders.updateOne',
              params: {
                filter: { orderId: targetOrder.orderId },
                update: { shippingAddress: newAddress }
              }
            },
            mutations: async () => {
              await apiRequest(`/api/orders/${encodeURIComponent(targetOrder.orderId)}`, {
                method: 'PATCH',
                body: JSON.stringify({ shippingAddress: newAddress })
              });
              targetOrder.shippingAddress = newAddress;
              renderOrders(targetOrder.orderId);
            },
            observation: {
              orderId: targetOrder.orderId,
              modifiedCount: 1,
              updatedAddress: newAddress
            }
          });

          currentTraceSteps.push({
            stepNumber: 5,
            phaseNumber: 5,
            phase: 'SYNTHESIS',
            title: 'Confirmation Resolution',
            titleHi: 'पता सुधार पुष्टि',
            thought: 'Confirming address update to user.',
            thoughtHi: 'ग्राहक को पता सफलतापूर्ण बदलने की पुष्टि देना।',
            finalReplyEn: `Great news! Because order **#${targetOrder.orderId}** (${targetOrder.itemName}) is still in the 'Processing' packaging stage, I have safely updated your shipping address to:

📍 **${newAddress}**

The courier will receive the updated destination when dispatched.`,
            finalReplyHi: `शुभ समाचार! क्योंकि आपका ऑर्डर **#${targetOrder.orderId}** (${targetOrder.itemName}) अभी पैकेजिंग (Processing) स्टेज में है, मैंने आपका डिलीवरी पता सफलतापूर्ण अपडेट कर दिया है:

📍 **${newAddress}**

डिस्पैच के समय कूरियर को यही नया पता दिया जाएगा।`,
            orderId: targetOrder.orderId,
            guardrailPassed: true
          });
        } else {
          currentTraceSteps.push({
            stepNumber: 4,
            phaseNumber: 5,
            phase: 'SYNTHESIS',
            title: 'Policy Rejection Explanation',
            titleHi: 'पॉलिसी अस्वीकृति स्पष्टीकरण',
            thought: 'Explaining courier route freeze politely to customer.',
            thoughtHi: 'ग्राहक को विनम्रतापूर्वक कूरियर रूट फ्रीज़ की जानकारी देना।',
            finalReplyEn: `I checked order **#${targetOrder.orderId}**, but we cannot modify the delivery destination because it is already '${targetOrder.status}' with the courier.

• **Current Courier:** ${targetOrder.carrier}
• **Tracking ID:** \`${targetOrder.trackingId}\`
• **Alternative Option:** Once the delivery executive calls you for delivery, you may request a local handover or reschedule.`,
            finalReplyHi: `क्षमा करें, ऑर्डर **#${targetOrder.orderId}** का डिलीवरी पता अब नहीं बदला जा सकता क्योंकि यह पहले से ही कूरियर के साथ '${targetOrder.status}' स्टेज पर है।

• **कूरियर:** ${targetOrder.carrier}
• **ट्रैकिंग आईडी:** \`${targetOrder.trackingId}\`
• **विकल्प:** जब डिलीवरी एग्जीक्यूटिव आपको कॉल करे, तो आप उसी क्षेत्र में हैंडओवर का अनुरोध कर सकते हैं।`,
            orderId: targetOrder.orderId,
            guardrailPassed: false
          });
        }
      }

      startExecution();
    }

    function startExecution() {
      if (executionMode === 'auto') {
        runAutoTrace();
      } else {
        executeNextStep();
      }
    }

    // Event Handlers
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = chatInput.value.trim();
      if (!val) return;
      chatInput.value = '';
      processUserQuery(val);
    });

    // Preset Scenario Handlers (Evaluates current language)
    document.getElementById('preset-1').addEventListener('click', () => {
      processUserQuery(currentLanguage === 'hi' ? scenarios.p1.queryHi : scenarios.p1.queryEn);
    });

    document.getElementById('preset-2').addEventListener('click', () => {
      processUserQuery(currentLanguage === 'hi' ? scenarios.p2.queryHi : scenarios.p2.queryEn);
    });

    document.getElementById('preset-3').addEventListener('click', () => {
      processUserQuery(currentLanguage === 'hi' ? scenarios.p3.queryHi : scenarios.p3.queryEn);
    });

    document.getElementById('preset-4').addEventListener('click', () => {
      processUserQuery(currentLanguage === 'hi' ? scenarios.p4.queryHi : scenarios.p4.queryEn);
    });

    // Step-by-Step Debugger Controls
    btnNextStep.addEventListener('click', () => {
      void executeNextStep();
    });

    btnRunAll.addEventListener('click', async () => {
      while (currentStepIndex < currentTraceSteps.length) {
        const previousStepIndex = currentStepIndex;
        await executeNextStep();
        if (previousStepIndex === currentStepIndex) break;
        await new Promise(r => setTimeout(r, 200));
      }
    });

    // Language Toggle Buttons
    const langEnBtn = document.getElementById('lang-en');
    const langHiBtn = document.getElementById('lang-hi');

    langEnBtn.addEventListener('click', () => {
      applyLanguage('en');
      showToast(i18n.en.toastLangSwitched);
    });

    langHiBtn.addEventListener('click', () => {
      applyLanguage('hi');
      showToast(i18n.hi.toastLangSwitched);
    });

    // Execution Mode Toggle
    const modeAutoBtn = document.getElementById('mode-auto');
    const modeStepBtn = document.getElementById('mode-step');

    modeAutoBtn.addEventListener('click', () => {
      executionMode = 'auto';
      modeAutoBtn.className = 'px-2.5 py-1 rounded-md font-medium transition bg-indigo-600 text-white shadow-sm flex items-center gap-1.5';
      modeStepBtn.className = 'px-2.5 py-1 rounded-md font-medium text-slate-300 hover:text-white transition flex items-center gap-1.5';
      stepControls.classList.add('hidden');
      showToast(currentLanguage === 'hi' ? 'ऑटो-रन मोड सक्रिय' : 'Switched to Auto-Run Execution Mode');
    });

    modeStepBtn.addEventListener('click', () => {
      executionMode = 'step';
      modeStepBtn.className = 'px-2.5 py-1 rounded-md font-medium transition bg-indigo-600 text-white shadow-sm flex items-center gap-1.5';
      modeAutoBtn.className = 'px-2.5 py-1 rounded-md font-medium text-slate-300 hover:text-white transition flex items-center gap-1.5';
      stepControls.classList.remove('hidden');
      showToast(currentLanguage === 'hi' ? 'स्टेप-बाय-स्टेप डीबगर सक्रिय' : 'Step-by-Step Debugger Mode Activated');
    });

    // Tab Navigation in Column 3
    const tabDb = document.getElementById('tab-db');
    const tabArch = document.getElementById('tab-arch');
    const tabEval = document.getElementById('tab-eval');

    const contentDb = document.getElementById('content-db');
    const contentArch = document.getElementById('content-arch');
    const contentEval = document.getElementById('content-eval');

    function selectTab(activeTab, activeContent) {
      [tabDb, tabArch, tabEval].forEach(t => {
        t.className = 'flex-1 py-3 px-2 text-slate-400 hover:text-slate-200 text-center transition flex items-center justify-center gap-1';
      });
      [contentDb, contentArch, contentEval].forEach(c => c.classList.add('hidden'));

      activeTab.className = 'flex-1 py-3 px-2 font-semibold text-cyan-400 border-b-2 border-cyan-400 text-center transition flex items-center justify-center gap-1';
      activeContent.classList.remove('hidden');
    }

    tabDb.addEventListener('click', () => selectTab(tabDb, contentDb));
    tabArch.addEventListener('click', () => selectTab(tabArch, contentArch));
    tabEval.addEventListener('click', () => selectTab(tabEval, contentEval));

    // Modal Control
    const projectModal = document.getElementById('project-modal');
    document.getElementById('btn-open-modal').addEventListener('click', () => {
      projectModal.classList.remove('hidden');
    });
    document.getElementById('btn-close-modal').addEventListener('click', () => {
      projectModal.classList.add('hidden');
    });
    document.getElementById('btn-modal-dismiss').addEventListener('click', () => {
      projectModal.classList.add('hidden');
    });

    // Toast Notification Utility
    function showToast(message) {
      const existing = document.getElementById('active-toast');
      if (existing) existing.remove();

      const toast = document.createElement('div');
      toast.id = 'active-toast';
      toast.className = 'fixed bottom-4 right-4 z-50 bg-slate-900 border border-cyan-500/60 text-cyan-300 text-xs px-3.5 py-2.5 rounded-xl shadow-2xl font-medium transition-all transform duration-300 flex items-center gap-2';
      toast.innerHTML = `<span>🔔</span> <span>${escapeHtml(message)}</span>`;
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 2500);
    }

    // Initial Bootstrap
    const welcomeTtsBtn = document.getElementById('welcome-tts-btn');
    if (welcomeTtsBtn) {
      welcomeTtsBtn.addEventListener('click', () => {
        const text = currentLanguage === 'hi' ? i18n.hi.welcomeMsg : i18n.en.welcomeMsg;
        speakText(text, welcomeTtsBtn);
      });
    }
    applyLanguage('en');
    void initializeDatabase();
