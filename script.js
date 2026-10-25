(function () {
  'use strict';

  // ==========================================
  // 1. УМНЫЙ ПОИСК (РАБОТАЕТ ВЕЗДЕ)
  // ==========================================
  function initSmartSearch() {
    var input = document.querySelector('.doc-search');
    if (!input) return; // Если на странице нет поиска, выходим

    input.addEventListener('input', function() {
      var q = this.value.toLowerCase().trim();
      
      // Сброс предыдущих результатов поиска
      document.querySelectorAll('mark').forEach(m => {
        const parent = m.parentNode;
        parent.replaceChild(document.createTextNode(m.textContent), m);
        parent.normalize();
      });
      document.querySelectorAll('.article-card.hit').forEach(a => a.classList.remove('hit'));
      document.querySelectorAll('.acc-text p').forEach(p => {
        p.style.background = '';
        p.style.borderLeft = '';
        p.style.paddingLeft = '';
      });

      // Если строка пустая — показываем всё и закрываем аккордеоны
      if (!q) {
        document.querySelectorAll('.article-card, .acc-item').forEach(i => i.style.display = '');
        document.querySelectorAll('.acc-item').forEach(i => i.classList.remove('open'));
        return;
      }

      // --- ПОИСК ПО КАРТОЧКАМ (УК / КоАП) ---
      document.querySelectorAll('.article-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        
        if (text.includes(q)) {
          card.style.display = '';
          card.classList.add('hit'); // Синяя обводка
          
          // Подсветка текста желтым маркером
          const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT, null);
          const nodes = [];
          while(walker.nextNode()) nodes.push(walker.currentNode);
          const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'gi');
          
          nodes.forEach(node => {
            if(!re.test(node.nodeValue)) return;
            re.lastIndex = 0;
            const frag = document.createDocumentFragment();
            let last = 0, m;
            while((m = re.exec(node.nodeValue))){
              frag.appendChild(document.createTextNode(node.nodeValue.slice(last, m.index)));
              const mark = document.createElement('mark');
              mark.textContent = m[0];
              frag.appendChild(mark);
              last = m.index + m[0].length;
            }
            frag.appendChild(document.createTextNode(node.nodeValue.slice(last)));
            node.parentNode.replaceChild(frag, node);
          });
        } else {
          card.style.display = 'none';
        }
      });

      // --- ПОИСК ПО АККОРДЕОНАМ (Устав / Процессуальный / Госсобственность) ---
      document.querySelectorAll('.acc-item').forEach(item => {
        let hasMatch = false;
        let ps = item.querySelectorAll('.acc-text p, .acc-text div');

        ps.forEach(p => {
          if (p.textContent.toLowerCase().includes(q)) {
            hasMatch = true;
            // Подсветка найденного абзаца
            p.style.background = 'rgba(59, 130, 246, 0.15)';
            p.style.borderLeft = '3px solid #3b82f6';
            p.style.paddingLeft = '8px';
            p.style.borderRadius = '4px';
          }
        });

        if (hasMatch) {
          item.style.display = '';
          item.classList.add('open'); // Автоматически раскрываем
        } else {
          item.style.display = 'none';
          item.classList.remove('open');
        }
      });
    });
  }

  // ==========================================
  // 2. АККОРДЕОН
  // ==========================================
  function initAccordion() {
    document.querySelectorAll('.acc-header').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var item = btn.closest('.acc-item');
        var isOpen = item.classList.contains('open');
        
        // Закрываем все остальные
        document.querySelectorAll('.acc-item').forEach(function(i) { 
          i.classList.remove('open'); 
        });
        
        // Открываем текущий, если он был закрыт
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  // ==========================================
  // 3. ИИ-ЮРИСТ
  // ==========================================
  function initAI() {
    var aiBtn = document.getElementById('aiBtn');
    var aiDropdown = document.getElementById('aiDropdown');
    if (!aiBtn || !aiDropdown) return; // Если на странице нет ИИ, выходим

    // Открытие/закрытие окна
    aiBtn.addEventListener('click', function(e) {
      e.preventDefault();
      aiDropdown.classList.toggle('active');
      if (aiDropdown.classList.contains('active')) {
        document.getElementById('aiChatInput').focus();
      }
    });

    // Закрытие при клике вне окна
    document.addEventListener('click', function(e) {
      if (!aiDropdown.contains(e.target) && !aiBtn.contains(e.target)) {
        aiDropdown.classList.remove('active');
      }
    });

    // Функция отправки сообщения
    window.sendAI = function() {
      var input = document.getElementById('aiChatInput');
      var body = document.getElementById('aiChatBody');
      var query = input.value.toLowerCase().trim();
      if (!query) return;

      // Добавляем сообщение пользователя
      var userMsg = document.createElement('div');
      userMsg.className = 'ai-msg user';
      userMsg.textContent = input.value;
      body.appendChild(userMsg);
      input.value = '';
      body.scrollTop = body.scrollHeight;

      // Имитация задержки ответа
      setTimeout(function() {
        var bestMatch = null;
        var maxScore = 0;
        
        // БАЗА ЗНАНИЙ ИИ (Обновленная и расширенная)
        var KB = [
          // УК РФ
          { keys: ['убийство', 'убил', '37.1', '37'], title: 'Ст. 37 УК РФ', ans: 'Убийство. 7 лет лишения свободы (СПРП ★★★★).', url: 'uk.html' },
          { keys: ['кража', 'украл', '44'], title: 'Ст. 44 УК РФ', ans: 'Кража. Штраф 30.000 или 3 года лишения свободы.', url: 'uk.html' },
          { keys: ['грабеж', 'ограбил', '46'], title: 'Ст. 46 УК РФ', ans: 'Грабеж. 4 года лишения свободы.', url: 'uk.html' },
          { keys: ['разбой', 'напал', '47'], title: 'Ст. 47 УК РФ', ans: 'Разбой. 5 лет лишения свободы.', url: 'uk.html' },
          { keys: ['наркотики', 'вещества', '64'], title: 'Ст. 64 УК РФ', ans: 'Незаконный оборот наркотиков. 5 лет.', url: 'uk.html' },
          { keys: ['взятка', '79'], title: 'Ст. 79 УК РФ', ans: 'Получение/дача взятки. 8 лет лишения свободы.', url: 'uk.html' },
          
          // КоАП РФ
          { keys: ['хулиганство', '8.1'], title: 'Ст. 8.1 КоАП', ans: 'Мелкое хулиганство. Штраф до 30.000 или арест 7 суток.', url: 'koap.html' },
          { keys: ['побои', '8.2'], title: 'Ст. 8.2 КоАП', ans: 'Побои. Штраф до 30.000 или арест 7 суток.', url: 'koap.html' },
          { keys: ['тонировка', '9.4'], title: 'Ст. 9.4 КоАП', ans: 'Тонировка. Штраф 15.000.', url: 'koap.html' },
          { keys: ['пьяный', 'опьянение', '9.42'], title: 'Ст. 9.42 КоАП', ans: 'Управление ТС в состоянии опьянения. Штраф 30.000 или лишение прав.', url: 'koap.html' },
          
          // Процессуальный кодекс
          { keys: ['адвокат', '9'], title: 'Ст. 9 ПК РФ', ans: 'Ожидание адвоката 5 минут.', url: 'process.html' },
          { keys: ['задержание', '6'], title: 'Ст. 6 ПК РФ', ans: 'Задержание не более 60 минут.', url: 'process.html' },
          { keys: ['обыск', '19.1'], title: 'Ст. 19.1 ПК РФ', ans: 'Личный обыск без постановления при задержании.', url: 'process.html' },
          
          // Устав УФСИН
          { keys: ['устав', 'иерархия', 'звания'], title: 'Устав УФСИН', ans: 'Правила службы, субординация и звания.', url: 'federation-charter.html' },
          { keys: ['шизо', 'изолятор'], title: 'ШИЗО', ans: 'Помещение в ШИЗО за нарушение режима.', url: 'federation-rules.html' },
          { keys: ['боди-камера', 'рация'], title: 'Устав (п. 3.1)', ans: 'При заступлении на службу обязательно иметь боди-камеру и рацию.', url: 'federation-charter.html' },
          
          // Госсобственность
          { keys: ['кремль', 'московский кремль'], title: 'ФЗ О госсобственности', ans: 'Московский Кремль является закрытой и охраняемой территорией.', url: 'property.html' },
          { keys: ['закрытая территория', 'охраняемая', 'пропуск'], title: 'ФЗ О госсобственности', ans: 'Правила доступа на закрытые и охраняемые территории.', url: 'property.html' }
        ];

        // Поиск совпадений
        KB.forEach(function(item) {
          var score = 0;
          item.keys.forEach(function(k) { 
            if (query.includes(k)) score++; 
          });
          if (score > maxScore) { 
            maxScore = score; 
            bestMatch = item; 
          }
        });

        // Формирование ответа
        var botMsg = document.createElement('div');
        botMsg.className = 'ai-msg bot';
        
        if (bestMatch) {
          botMsg.innerHTML = '<strong>' + bestMatch.title + '</strong><br>' + bestMatch.ans + '<br><br><a href="' + bestMatch.url + '">🔗 Перейти к статье</a>';
        } else {
          botMsg.innerHTML = 'Не нашел подходящую статью. Попробуйте иначе (напр: "срок за кражу", "Кремль" или "19.1").';
        }
        
        body.appendChild(botMsg);
        body.scrollTop = body.scrollHeight;
      }, 400);
    };
  }

  // ==========================================
  // ЗАПУСК ВСЕХ СКРИПТОВ
  // ==========================================
  document.addEventListener('DOMContentLoaded', function() {
    initSmartSearch();
    initAccordion();
    initAI();
  });

})();
