/* ==========================================================================
   EHS HOME SERVICES - INTERACTIVE SCRIPT (FRAMER DUAL TONE)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const navbar = document.querySelector('.navbar-framer');

  // =========================================================================
  // 0. SISTEMA DE TRADUÇÃO PT / EN (i18n)
  // =========================================================================
  const safeStorage = {
    getItem(key) {
      try { return localStorage.getItem(key); } catch (e) { return null; }
    },
    setItem(key, value) {
      try { localStorage.setItem(key, value); } catch (e) {}
    }
  };

  const t = window.translations || {};
  let currentLang = safeStorage.getItem('ehsLang') || 'pt';

  function applyTranslations(lang) {
    const allTranslations = window.translations || {};
    const dict = allTranslations[lang];
    if (!dict) return;

    // Elementos com data-i18n (textContent simples ou HTML)
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        const val = dict[key];
        const isHtml = typeof val === 'string' && (val.includes('<') || val.includes('&'));
        if (isHtml) {
          el.innerHTML = val;
        } else {
          el.textContent = val;
        }
      }
    });

    // Elementos com data-i18n-ph (placeholders)
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      if (dict[key] !== undefined) el.placeholder = dict[key];
    });

    // Elementos com data-i18n-aria (aria-label)
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      if (dict[key] !== undefined) el.setAttribute('aria-label', dict[key]);
    });

    // Atualizar o atributo lang do HTML
    document.documentElement.lang = lang === 'pt' ? 'pt-PT' : 'en';

    // Sincronizar botões activos (desktop + mobile)
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      btn.classList.toggle('active', btnLang === lang);
    });

    currentLang = lang;
    safeStorage.setItem('ehsLang', lang);
  }

  // Ligar todos os botões de idioma (desktop + mobile overlay)
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const lang = e.currentTarget.getAttribute('data-lang');
      if (lang) {
        applyTranslations(lang);
      }
    });
  });

  // Aplicar idioma guardado ao carregar
  applyTranslations(currentLang);

  // Expõe currentLang para outras funções
  window.getCurrentLang = () => currentLang;

  // 1. ANIMAÇÕES AO SCROLL (INTERSECTION OBSERVER COM FALLBACK)
  document.documentElement.classList.add('js-observer');
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Revela apenas uma vez
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // 2. CONTROLO DO ESTADO DO CABEÇALHO (SCROLL DETECTOR)
  const mainHeader = document.querySelector('.main-header');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      mainHeader.classList.add('scrolled');
    } else {
      mainHeader.classList.remove('scrolled');
    }
  });

  // 3. WIDGET DE WHATSAPP (APARECIMENTO DO BALÃO DE TEXTO COM ATRASO)
  const whatsappTooltip = document.getElementById('whatsappTooltip');
  
  if (whatsappTooltip) {
    setTimeout(() => {
      whatsappTooltip.classList.add('visible');
    }, 2000); // 2 segundos de atraso
  }

  // 4. SIMULADOR DE BTUs PARA AR CONDICIONADO (LAYOUT COMPLETO)
  const btuSimArea = document.getElementById('btuSimArea');
  const btuSimPeople = document.getElementById('btuSimPeople');
  const btuSimSun = document.getElementById('btuSimSun');
  const btuSimLocation = document.getElementById('btuSimLocation');
  const btuSimInsulation = document.getElementById('btuSimInsulation');
  const btuSimDevices = document.getElementById('btuSimDevices');
  const btuCalcBtn = document.getElementById('btuCalcBtn');
  const btuPlaceholder = document.getElementById('btuPlaceholder');
  const btuResult = document.getElementById('btuResult');
  const btuResultValue = document.getElementById('btuResultValue');
  const btuResultKw = document.getElementById('btuResultKw');
  const btuResultDesc = document.getElementById('btuResultDesc');
  const btuResultParams = document.getElementById('btuResultParams');
  const btuWaBtn = document.getElementById('btuWaBtn');

  function calculateBtuNew() {
    if (!btuSimArea) return;

    const area = parseFloat(btuSimArea.value);

    // Validação se o utilizador não preencheu a área
    if (isNaN(area) || area <= 0) {
      if (btuPlaceholder && btuResult) {
        btuPlaceholder.style.display = 'block';
        btuResult.style.display = 'none';
      }
      btuSimArea.focus();
      btuSimArea.style.borderColor = '#EF4444';
      setTimeout(() => { btuSimArea.style.borderColor = ''; }, 2000);
      return;
    }

    // Lógica de cálculo baseada estritamente na folha do utilizador
    // Mapeamento:
    // - low (Sol da manhã) -> Coluna "Sol de Manhã"
    // - medium (Sol da tarde) ou high (Sol o dia todo) -> Coluna "Sol à Tarde ou o Dia Todo"
    const sunVal = btuSimSun ? btuSimSun.value : 'medium';
    const isAfternoonSun = (sunVal === 'medium' || sunVal === 'high');
    const lang = window.getCurrentLang ? window.getCurrentLang() : 'pt';

    // Obter parâmetros adicionais para as tags e a mensagem do WhatsApp
    const peopleCount = parseInt(btuSimPeople ? btuSimPeople.value : '2', 10);
    const locVal = btuSimLocation ? btuSimLocation.value : 'mid';
    const insVal = btuSimInsulation ? btuSimInsulation.value : 'good';
    const devVal = btuSimDevices ? btuSimDevices.value : 'few';

    let finalBtu = 12000;
    let finalKw = '3.5 kW';
    let descText = '';

    if (area <= 10) {
      finalBtu = 7500;
      finalKw = '2.2 kW';
      descText = lang === 'pt' ? 'Ideal para divisões compactas com necessidade reduzida de climatização.' : 'Ideal for compact rooms with reduced climatization needs.';
    } else if (area <= 12) {
      finalBtu = isAfternoonSun ? 10000 : 7500;
      finalKw = isAfternoonSun ? '2.8 kW' : '2.2 kW';
      descText = isAfternoonSun 
        ? (lang === 'pt' ? 'Recomendado para quartos ou escritórios garantindo conforto ideal.' : 'Recommended for bedrooms or offices ensuring ideal comfort.')
        : (lang === 'pt' ? 'Ideal para divisões compactas com necessidade reduzida de climatização.' : 'Ideal for compact rooms with reduced climatization needs.');
    } else if (area <= 15) {
      finalBtu = 10000;
      finalKw = '2.8 kW';
      descText = lang === 'pt' ? 'Recomendado para quartos ou escritórios garantindo conforto ideal.' : 'Recommended for bedrooms or offices ensuring ideal comfort.';
    } else if (area <= 20) {
      finalBtu = 12000;
      finalKw = '3.5 kW';
      descText = lang === 'pt' ? 'Ideal para salas de estar ou suítes médias.' : 'Ideal for medium living rooms or suites.';
    } else if (area <= 25) {
      finalBtu = isAfternoonSun ? 15000 : 12000;
      finalKw = isAfternoonSun ? '4.2 kW' : '3.5 kW';
      descText = isAfternoonSun
        ? (lang === 'pt' ? 'Recomendado para salas de tamanho intermédio com excelente rendimento.' : 'Recommended for medium-sized rooms with excellent performance.')
        : (lang === 'pt' ? 'Ideal para salas de estar ou suítes médias.' : 'Ideal for medium living rooms or suites.');
    } else if (area <= 30) {
      finalBtu = isAfternoonSun ? 18000 : 15000;
      finalKw = isAfternoonSun ? '5.0 kW' : '4.2 kW';
      descText = isAfternoonSun
        ? (lang === 'pt' ? 'Elevada capacidade de climatização para espaços abertos e salas grandes.' : 'High climatization capacity for open spaces and large rooms.')
        : (lang === 'pt' ? 'Recomendado para salas de tamanho intermédio com excelente rendimento.' : 'Recommended for medium-sized rooms with excellent performance.');
    } else if (area <= 40) {
      finalBtu = isAfternoonSun ? 21000 : 18000;
      finalKw = isAfternoonSun ? '6.0 kW' : '5.0 kW';
      descText = isAfternoonSun
        ? (lang === 'pt' ? 'Potência elevada para grandes divisões ou com forte exposição solar.' : 'High power for large rooms or with high sun exposure.')
        : (lang === 'pt' ? 'Elevada capacidade de climatização para espaços abertos e salas grandes.' : 'High climatization capacity for open spaces and large rooms.');
    } else if (area <= 60) {
      finalBtu = isAfternoonSun ? 30000 : 21000;
      finalKw = isAfternoonSun ? '8.5 kW' : '6.0 kW';
      descText = isAfternoonSun
        ? (lang === 'pt' ? 'Capacidade máxima individual para grandes salões ou escritórios abertos.' : 'Maximum individual capacity for large halls or open offices.')
        : (lang === 'pt' ? 'Potência elevada para grandes divisões ou com forte exposição solar.' : 'High power for large rooms or with high sun exposure.');
    } else if (area <= 70) {
      finalBtu = 30000;
      finalKw = '8.5 kW';
      descText = lang === 'pt' ? 'Capacidade máxima individual para grandes salões ou escritórios abertos.' : 'Maximum individual capacity for large halls or open offices.';
    } else {
      finalBtu = 36000;
      finalKw = '10.0 kW (Multi-Split / Condutas)';
      descText = lang === 'pt' 
        ? 'Recomendada a instalação de sistema Multi-Split ou condutas para cobrir a elevada área.' 
        : 'Multi-Split or ducted system recommended to cover the large area.';
    }

    const btuFormatted = finalBtu >= 36000 ? '36.000+ BTU/h' : `${finalBtu.toLocaleString('pt-PT')} BTU/h`;

    if (btuResultValue) btuResultValue.textContent = btuFormatted;
    if (btuResultKw) btuResultKw.textContent = `≈ ${finalKw}`;
    if (btuResultDesc) btuResultDesc.textContent = descText;

    // Gerar tags dos 6 parâmetros selecionados na UI
    const sunLabels = {
      low: lang === 'pt' ? 'Sol da manhã' : 'Morning sun',
      medium: lang === 'pt' ? 'Sol da tarde' : 'Afternoon sun',
      high: lang === 'pt' ? 'Sol o dia todo' : 'All day sun'
    };
    const locLabels = { ground: 'Rés-do-chão', mid: 'Andar Intermédio', top: 'Último Andar' };
    const insLabels = { poor: 'Isolamento Fraco', good: 'Isolamento Bom', excellent: 'Isolamento Excelente' };
    const devLabels = { few: 'Poucos Equipamentos', medium: 'Equipamentos Moderados', many: 'Muitos Equipamentos' };

    if (btuResultParams) {
      btuResultParams.innerHTML = `
        <span class="btu-param-tag">📐 ${area} m²</span>
        <span class="btu-param-tag">👥 ${peopleCount} p.</span>
        <span class="btu-param-tag">☀️ ${sunLabels[sunVal] || 'Sol'}</span>
        <span class="btu-param-tag">🏢 ${locLabels[locVal] || ''}</span>
        <span class="btu-param-tag">🏠 ${insLabels[insVal] || ''}</span>
        <span class="btu-param-tag">💻 ${devLabels[devVal] || ''}</span>
      `;
    }

    // Criar mensagem completa de WhatsApp com TODOS os parâmetros da simulação
    const msgLines = [
      `Olá! Fiz uma simulação de BTUs no site EHS com as seguintes características:`,
      `• Área: ${area} m²`,
      `• Pessoas: ${peopleCount}`,
      `• Exposição Solar: ${sunLabels[sunVal] || sunVal}`,
      `• Localização: ${locLabels[locVal] || locVal}`,
      `• Isolamento: ${insLabels[insVal] || insVal}`,
      `• Equipamentos: ${devLabels[devVal] || devVal}`,
      ``,
      `Potência Recomendada: ${btuFormatted} (≈ ${finalKw})`,
      ``,
      `Gostaria de solicitar um orçamento gratuito e apoio técnico para a minha habitação.`
    ];

    const waUrl = `https://wa.me/351926466333?text=${encodeURIComponent(msgLines.join('\n'))}`;

    if (btuWaBtn) {
      btuWaBtn.href = waUrl;
    }

    // Mostrar resultado e ocultar placeholder
    if (btuPlaceholder && btuResult) {
      btuPlaceholder.style.display = 'none';
      btuResult.style.display = 'block';

      // Scroll suave até ao resultado se estiver em mobile
      if (window.innerWidth < 900) {
        btuResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  // Ao clicar em Calcular BTU, APENAS mostra o resultado no ecrã (SEM redirecionar logo para o WhatsApp)
  if (btuCalcBtn) {
    btuCalcBtn.addEventListener('click', (e) => {
      e.preventDefault();
      calculateBtuNew();
    });
  }

  // Recalcular automaticamente ao mudar seleções (se o resultado já estiver visível)
  [btuSimArea, btuSimPeople, btuSimSun, btuSimLocation, btuSimInsulation, btuSimDevices].forEach(elem => {
    if (elem) {
      elem.addEventListener('change', () => {
        if (btuResult && btuResult.style.display === 'block') {
          calculateBtuNew();
        }
      });
    }
  });


  // 5. FAQ ACORDEÃO (TEMA CLARO)
  const faqItems = document.querySelectorAll('.faq-item-clear');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger-clear');
    const content = item.querySelector('.faq-content-clear');

    if (trigger && content) {
      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');

        // Fechar todos os outros acordeões
        faqItems.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('active')) {
            otherItem.classList.remove('active');
            otherItem.querySelector('.faq-content-clear').style.maxHeight = '0px';
          }
        });

        // Alternar o item atual
        if (isOpen) {
          item.classList.remove('active');
          content.style.maxHeight = '0px';
        } else {
          item.classList.add('active');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    }
  });

  // 6. FORMULÁRIO DE CAPTAÇÃO DE LEADS NO RODAPÉ (ENVIO REAL DE EMAIL POR PLATAFORMA GRATUITA FORMSUBMIT)
  const footerBookingForm = document.getElementById('footerBookingForm');
  const footerSuccessMessage = document.getElementById('footerSuccessMessage');
  const footerServiceSelect = document.getElementById('footerService');

  if (footerBookingForm) {
    footerBookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('footerName').value.trim();
      const phone = document.getElementById('footerPhone').value.trim();
      const emailInput = document.getElementById('footerEmail');
      const email = emailInput ? emailInput.value.trim() : '';
      const service = footerServiceSelect.value;
      const message = document.getElementById('footerMessage').value.trim();

      if (!name || !phone || !email || !message) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      const submitBtn = footerBookingForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'A enviar pedido...';
      }

      // Enviar via AJAX para o e-mail oficial através do FormSubmit
      fetch("https://formsubmit.co/ajax/geral@elitehomeservices.pt", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          Nome: name,
          Telefone: phone,
          Email: email,
          Servico: service,
          Mensagem: message,
          _subject: "Novo Contacto / Pedido de Orçamento - EHS Website"
        })
      })
      .then(response => {
        if (response.ok) {
          // Ocultar formulário e exibir mensagem de sucesso
          footerBookingForm.style.display = 'none';
          if (footerSuccessMessage) {
            footerSuccessMessage.style.display = 'block';
            footerSuccessMessage.classList.add('reveal', 'active');
          }
        } else {
          throw new Error('Falha no envio do email.');
        }
      })
      .catch(error => {
        console.error('Erro de envio:', error);
        alert('Ocorreu um erro ao enviar o seu pedido por e-mail. Por favor, tente novamente ou contacte-nos diretamente por telefone ou WhatsApp.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      });
    });
  }

  // 7. SCROLL SUAVE E DIRECIONAMENTO DE SERVIÇO
  const actionLinks = document.querySelectorAll('[data-scroll-to]');

  actionLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      // Obter o serviço para pré-selecionar
      const serviceToSelect = link.getAttribute('data-service');
      
      if (serviceToSelect && footerServiceSelect) {
        footerServiceSelect.value = serviceToSelect;
      }

      // Reset do formulário caso o utilizador já o tenha enviado anteriormente
      if (footerBookingForm && footerBookingForm.style.display === 'none') {
        footerBookingForm.style.display = 'block';
        if (footerSuccessMessage) footerSuccessMessage.style.display = 'none';
        footerBookingForm.reset();
        if (serviceToSelect && footerServiceSelect) {
          footerServiceSelect.value = serviceToSelect;
        }
      }

      // Scroll suave
      if (targetElement) {
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - 80;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // 8. SLIDER INTERATIVO ANTES/DEPOIS (HIGIENIZAÇÃO)
  const rangeSlider = document.getElementById('beforeAfterRange');
  const imgBefore = document.querySelector('.before-after-slider .img-before');
  const sliderBar = document.querySelector('.before-after-slider .slider-bar');

  if (rangeSlider && imgBefore && sliderBar) {
    rangeSlider.addEventListener('input', (e) => {
      const value = e.target.value;
      imgBefore.style.width = `${value}%`;
      sliderBar.style.left = `${value}%`;
    });
  }

  // 9. CONTROLO DO MENU MÓVEL OVERLAY
  const mobileMenuTrigger = document.getElementById('mobileMenuTrigger');
  const mobileMenuClose = document.getElementById('mobileMenuClose');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileMenuTrigger && mobileMenuOverlay) {
    const openMenu = () => {
      mobileMenuOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      mobileMenuOverlay.classList.remove('active');
      document.body.style.overflow = '';
    };

    mobileMenuTrigger.addEventListener('click', openMenu);
    
    if (mobileMenuClose) {
      mobileMenuClose.addEventListener('click', closeMenu);
    }

    // Fechar menu quando clica fora do conteúdo
    mobileMenuOverlay.addEventListener('click', (e) => {
      if (e.target === mobileMenuOverlay) {
        closeMenu();
      }
    });

    // Fechar menu ao clicar em qualquer link móvel e rolar suavemente
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        closeMenu();

        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          setTimeout(() => {
            const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }, 300); // Pequena pausa para a animação do menu fechar primeiro
        }
      });
    });
  }

  // 10. COOKIES E MODAL DE POLÍTICA DE PRIVACIDADE
  const cookieConsentBanner = document.getElementById('cookieConsentBanner');
  const acceptCookiesBtn = document.getElementById('acceptCookiesBtn');
  const rejectCookiesBtn = document.getElementById('rejectCookiesBtn');
  const privacyModal = document.getElementById('privacyModal');
  const openPrivacyBtn = document.getElementById('openPrivacyBtn');
  const closePrivacyBtn = document.getElementById('closePrivacyBtn');
  const agreePrivacyBtn = document.getElementById('agreePrivacyBtn');
  const cookiePrivacyLink = document.getElementById('cookiePrivacyLink');

  // Gestão de Cookies
  if (cookieConsentBanner && acceptCookiesBtn && rejectCookiesBtn) {
    const cookieConsent = safeStorage.getItem('ehsCookieConsent');
    if (!cookieConsent) {
      setTimeout(() => {
        cookieConsentBanner.style.transform = 'translateX(-50%) translateY(0)';
      }, 1000);
    }

    acceptCookiesBtn.addEventListener('click', () => {
      safeStorage.setItem('ehsCookieConsent', 'accepted');
      cookieConsentBanner.style.transform = 'translateX(-50%) translateY(150%)';
    });

    rejectCookiesBtn.addEventListener('click', () => {
      safeStorage.setItem('ehsCookieConsent', 'rejected');
      cookieConsentBanner.style.transform = 'translateX(-50%) translateY(150%)';
    });
  }

  // Gestão do Modal de Privacidade
  if (privacyModal) {
    const openModal = (e) => {
      e.preventDefault();
      privacyModal.style.visibility = 'visible';
      privacyModal.style.opacity = '1';
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      privacyModal.style.opacity = '0';
      document.body.style.overflow = '';
      setTimeout(() => {
        privacyModal.style.visibility = 'hidden';
      }, 400);
    };

    if (openPrivacyBtn) openPrivacyBtn.addEventListener('click', openModal);
    if (cookiePrivacyLink) cookiePrivacyLink.addEventListener('click', openModal);
    if (closePrivacyBtn) closePrivacyBtn.addEventListener('click', closeModal);
    if (agreePrivacyBtn) agreePrivacyBtn.addEventListener('click', closeModal);

    // Fechar modal ao clicar fora
    privacyModal.addEventListener('click', (e) => {
      if (e.target === privacyModal) {
        closeModal();
      }
    });
  }

});
