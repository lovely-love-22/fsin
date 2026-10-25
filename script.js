(function () {
  'use strict';

  // 1. УМНЫЙ ПОИСК (РАБОТАЕТ И ДЛЯ КАРТОЧЕК, И ДЛЯ АККОРДЕОНОВ)
  function initSmartSearch() {
    var input = document.querySelector('.doc-search');
    if (!input) return;

    input.addEventListener('input', function() {
      var q = this.value.toLowerCase().trim();
      
      // Сброс подсветки
      document.querySelectorAll('mark').forEach(m => {
        const parent = m.parentNode;
        parent.replaceChild(document.createTextNode(m.textContent), m);
        parent.normalize();
      });
      document.querySelectorAll('.article-card.hit').forEach(a => a.classList.remove('hit'));

      if (!q) {
        // Показать всё
        document.querySelectorAll('.article-card, .acc-item').forEach(i => i.style.display = '');
        document.querySelectorAll('.acc-item').forEach(i => i.classList.remove('open'));
        return;
      }

      // --- Поиск по карточкам (УК / КоАП) ---
      document.querySelectorAll('.article-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(q)) {
          card.style.display = '';
          card.classList.add('hit');
          
          // Подсветка текста
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

      // --- Поиск по аккордеонам (Устав / Процесс) ---
      document.querySelectorAll('.acc-item').forEach(item => {
        let hasMatch = false;
        let ps = item.querySelectorAll('.acc-text p');

        ps.forEach(p => {
          if (p.textContent.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)) {
            hasMatch = true;
            p.classList.add('highlight');
          } else {
            p.classList.remove('highlight');
          }
        });

        if (hasMatch) {
          item.style.display = '';
          item.classList.add('open');
        } else {
          item.style.display = 'none';
          item.classList.remove('open');
        }
      });
    });
  }

  // 2. АККОРДЕОН
  function initAccordion() {
    document.querySelectorAll('.acc-header').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var item = btn.closest('.acc-item');
        var isOpen = item.classList.contains('open');
        document.querySelectorAll('.acc-item').forEach(function(i) { i.classList.remove('open'); });
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  // 3. ИИ-ПОМОЩНИК
  function initAI() {
    var aiBtn = document.getElementById('aiBtn');
    var aiDropdown = document.getElementById('aiDropdown');
    if (!aiBtn || !aiDropdown) return;

    aiBtn.addEventListener('click', function(e) {
      e.preventDefault();
      aiDropdown.classList.toggle('active');
      if (aiDropdown.classList.contains('active')) {
        document.getElementById('aiChatInput').focus();
      }
    });

    document.addEventListener('click', function(e) {
      if (!aiDropdown.contains(e.target) && !aiBtn.contains(e.target)) {
        aiDropdown.classList.remove('active');
      }
    });

    window.sendAI = function() {
      var input = document.getElementById('aiChatInput');
      var body = document.getElementById('aiChatBody');
      var query = input.value.toLowerCase().trim();
      if (!query) return;

      var userMsg = document.createElement('div');
      userMsg.className = 'ai-msg user';
      userMsg.textContent = input.value;
      body.appendChild(userMsg);
      input.value = '';
      body.scrollTop = body.scrollHeight;

      setTimeout(function() {
        var bestMatch = null;
        var maxScore = 0;
        // База знаний
        var KB = [
          { keys: ['убийство', 'убил', '37'], title: 'Статья 37 УК РФ', ans: 'Убийство. 7 лет лишения свободы.', url: 'uk.html' },
          { keys: ['кража', 'украл', '44'], title: 'Статья 44 УК РФ', ans: 'Кража. Штраф 30.000 или 3 года.', url: 'uk.html' },
          { keys: ['грабеж', 'ограбил', '46'], title: 'Статья 46 УК РФ', ans: 'Грабеж. 4 года лишения свободы.', url: 'uk.html' },
          { keys: ['разбой', 'напал', '47'], title: 'Статья 47 УК РФ', ans: 'Разбой. 5 лет лишения свободы.', url: 'uk.html' },
          { keys: ['адвокат', '9'], title: 'Статья 9 ПК РФ', ans: 'Ожидание адвоката 5 минут.', url: 'process.html' },
          { keys: ['задержание', '6'], title: 'Статья 6 ПК РФ', ans: 'Задержание не более 60 минут.', url: 'process.html' },
          { keys: ['обыск', '19.1'], title: 'Статья 19.1 ПК РФ', ans: 'Личный обыск без постановления при задержании.', url: 'process.html' },
          { keys: ['шизо', 'изолятор'], title: 'ШИЗО', ans: 'Помещение в ШИЗО за нарушение режима.', url: 'federation-rules.html' },
          { keys: ['устав', 'иерархия'], title: 'Устав УФСИН', ans: 'Правила службы и иерархия званий.', url: 'federation-charter.html' }
        ];

        KB.forEach(function(item) {
          var score = 0;
          item.keys.forEach(function(k) { if (query.includes(k)) score++; });
          if (score > maxScore) { maxScore = score; bestMatch = item; }
        });

        var botMsg = document.createElement('div');
        botMsg.className = 'ai-msg bot';
        if (bestMatch) {
          botMsg.innerHTML = '<strong>' + bestMatch.title + '</strong><br>' + bestMatch.ans + '<br><br><a href="' + bestMatch.url + '">🔗 Перейти к статье</a>';
        } else {
          botMsg.innerHTML = 'Не нашел статью. Спросите иначе (напр: "срок за кражу" или "19.1").';
        }
        body.appendChild(botMsg);
        body.scrollTop = body.scrollHeight;
      }, 400);
    };
  }

  document.addEventListener('DOMContentLoaded', function() {
    initSmartSearch();
    initAccordion();
    initAI();
  });
})();
