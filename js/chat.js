/* Bizeny Akiko Chat Widget */
(function() {
  var API = '/bizeny/api/chat';
  var messages = [];
  var open = false;

  // Create DOM
  var bubble = el('div', 'akiko-chat-bubble');
  bubble.innerHTML = '<img src="images/akiko_face.jpg?v=5" alt="Bizeny彰子">';
  bubble.onclick = toggle;

  var tip = el('div', 'akiko-chat-tip');
  tip.textContent = '彰子とおはなししませんか？';
  tip.onclick = toggle;

  var panel = el('div', 'akiko-chat-panel');
  panel.innerHTML =
    '<div class="akiko-chat-header">' +
      '<span>Bizeny彰子とお話</span>' +
      '<button class="akiko-chat-close">&times;</button>' +
    '</div>' +
    '<div class="akiko-chat-messages" id="akiko-msgs"></div>' +
    '<div class="akiko-chat-input">' +
      '<input type="text" id="akiko-input" placeholder="メッセージを入力..." maxlength="200">' +
      '<button id="akiko-send">&#10148;</button>' +
    '</div>';

  document.body.appendChild(bubble);
  document.body.appendChild(tip);
  document.body.appendChild(panel);

  var msgsEl = document.getElementById('akiko-msgs');
  var inputEl = document.getElementById('akiko-input');
  var sendBtn = document.getElementById('akiko-send');
  panel.querySelector('.akiko-chat-close').onclick = toggle;
  sendBtn.onclick = send;
  var composing = false;
  inputEl.addEventListener('compositionstart', function() { composing = true; });
  inputEl.addEventListener('compositionend', function() { composing = false; });
  inputEl.onkeydown = function(e) { if (e.key === 'Enter' && !composing) { e.preventDefault(); send(); } };

  // Greeting
  setTimeout(function() {
    addMsg('akiko', 'Bonjour! わたしはBizeny彰子です。備前焼のこと、何でも聞いてくださいね。');
  }, 500);

  function toggle() {
    open = !open;
    panel.classList.toggle('open', open);
    bubble.classList.toggle('hide', open);
    tip.classList.toggle('hide', open);
    if (open) inputEl.focus();
  }

  function send() {
    var text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
    addMsg('user', text);
    messages.push({ role: 'user', text: text });

    // Show typing
    var typing = el('div', 'akiko-msg akiko-msg-akiko akiko-typing');
    typing.textContent = '...';
    var typingWrap = el('div', 'akiko-msg-akiko-wrap');
    var typingIcon = document.createElement('img');
    typingIcon.className = 'akiko-msg-icon';
    typingIcon.src = 'images/akiko_face.jpg?v=5';
    typingIcon.alt = '';
    typingWrap.appendChild(typingIcon);
    typingWrap.appendChild(typing);
    msgsEl.appendChild(typingWrap);
    scroll();

    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      msgsEl.removeChild(typingWrap);
      var reply = data.reply || data.error || 'Pardon...';
      addMsg('akiko', reply);
      messages.push({ role: 'assistant', text: reply });
    })
    .catch(function() {
      msgsEl.removeChild(typingWrap);
      addMsg('akiko', 'Pardon... 少しお時間をいただけますか。');
    });
  }

  function addMsg(who, text) {
    var d = el('div', 'akiko-msg akiko-msg-' + who);
    d.textContent = text;
    if (who === 'akiko') {
      var wrap = el('div', 'akiko-msg-akiko-wrap');
      var icon = document.createElement('img');
      icon.className = 'akiko-msg-icon';
      icon.src = 'images/akiko_face.jpg?v=5';
      icon.alt = '';
      wrap.appendChild(icon);
      wrap.appendChild(d);
      msgsEl.appendChild(wrap);
    } else {
      msgsEl.appendChild(d);
    }
    scroll();
  }

  function scroll() {
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  function el(tag, cls) {
    var e = document.createElement(tag);
    e.className = cls;
    return e;
  }
})();
