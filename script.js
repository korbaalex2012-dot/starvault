window.onload = function() {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
    }

    var userCoins = 0;
    var userStars = 0;

    var mainMenuScreen = document.getElementById('mainMenuScreen');
    var casesScreen = document.getElementById('casesScreen');
    var gamePlayScreen = document.getElementById('gamePlayScreen');
    var assetsScreen = document.getElementById('assetsScreen');
    var settingsWrapper = document.getElementById('settingsWrapper');

    function showScreen(screen) {
        if (!screen) return;
        mainMenuScreen.style.display = 'none';
        casesScreen.style.display = 'none';
        gamePlayScreen.style.display = 'none';
        assetsScreen.style.display = 'none';
        
        if (screen === mainMenuScreen) {
            settingsWrapper.style.display = 'flex';
        } else {
            settingsWrapper.style.display = 'none';
            settingsWrapper.classList.remove('open');
        }
        screen.style.display = 'flex';
    }

    // Универсальная обработка касаний для мобильного Telegram
    function bindTap(elementId, callback) {
        var el = document.getElementById(elementId);
        if (!el) return;

        var handler = function(e) {
            e.preventDefault();
            e.stopPropagation();
            callback();
        };

        if (window.PointerEvent) {
            el.addEventListener('pointerdown', handler, false);
        } else {
            el.addEventListener('touchstart', handler, false);
            el.addEventListener('click', handler, false);
        }
    }

    // НАВИГАЦИЯ
    bindTap('btnGoToCases', function() { showScreen(casesScreen); });
    bindTap('btnBackToMenuFromCases', function() { showScreen(mainMenuScreen); });
    bindTap('btnBackToCases', function() { showScreen(casesScreen); });
    
    bindTap('btnGoToAssets', function() {
        document.getElementById('coinBal').innerText = userCoins;
        document.getElementById('starBal').innerText = userStars;
        showScreen(assetsScreen);
    });
    bindTap('btnBackToMenuFromAssets', function() { showScreen(mainMenuScreen); });

    // НАСТРОЙКИ
    bindTap('triggerGear', function() { settingsWrapper.classList.toggle('open'); });
    bindTap('triggerArrow', function() { settingsWrapper.classList.toggle('open'); });
    bindTap('btnCup', function() { settingsWrapper.classList.remove('open'); });
    bindTap('btnLang', function() { settingsWrapper.classList.remove('open'); });

    // ЗАГЛУШКИ
    bindTap('btnPvpStub', function() { showScreen(mainMenuScreen); });
    bindTap('btnDailyStub', function() { showScreen(mainMenuScreen); });
    bindTap('btnShopStub', function() { showScreen(mainMenuScreen); });
    
    bindTap('btnInviteFriend', function() {
        var btn = document.getElementById('btnInviteFriend');
        btn.innerText = "ГОТОВО!";
        setTimeout(function(){ btn.innerText = "Пригласить"; }, 2000);
    });

    // ИГРА
    var currentSecretCode = [1, 2, 3, 4, 5];
    var currentDrumValues = [1, 1, 1, 1, 1];
    var gameDifficulty = "hard";

    var caseCards = document.querySelectorAll('.case-card');
    caseCards.forEach(function(card) {
        var cardHandler = function(e) {
            e.preventDefault();
            var name = card.getAttribute('data-name');
            document.getElementById('gameScreenTitle').innerText = name;
            
            gameDifficulty = (name === "Деревянный" || name === "Бронзовый" || name === "Медный") ? "easy" : "hard";
            
            currentSecretCode = [];
            for(var i=0; i<5; i++) {
                currentSecretCode.push(Math.floor(Math.random() * 9) + 1);
            }
            
            currentDrumValues = [1, 1, 1, 1, 1];
            for(var i=0; i<5; i++) {
                document.getElementById('drum-' + i).innerText = "1";
            }
            
            var radar = document.getElementById('radarDisplay');
            radar.innerText = "---";
            radar.style.color = "var(--text-muted)";
            
            showScreen(gamePlayScreen);
        };

        if (window.PointerEvent) {
            card.addEventListener('pointerdown', cardHandler, false);
        } else {
            card.addEventListener('click', cardHandler, false);
        }
    });

    var drumButtons = document.querySelectorAll('.drum-btn');
    drumButtons.forEach(function(btn) {
        var drumHandler = function(e) {
            e.preventDefault();
            var idx = parseInt(btn.getAttribute('data-drum'));
            var dir = parseInt(btn.getAttribute('data-dir'));
            
            var val = currentDrumValues[idx] + dir;
            if (val > 9) val = 1;
            if (val < 1) val = 9;
            
            currentDrumValues[idx] = val;
            document.getElementById('drum-' + idx).innerText = val;
        };

        if (window.PointerEvent) {
            btn.addEventListener('pointerdown', drumHandler, false);
        } else {
            btn.addEventListener('click', drumHandler, false);
        }
    });

    bindTap('btnCheckCode', function() {
        var exactMatches = 0;   
        var partialMatches = 0; 

        var sCopy = [currentSecretCode[0], currentSecretCode[1], currentSecretCode[2], currentSecretCode[3], currentSecretCode[4]];
        var dCopy = [currentDrumValues[0], currentDrumValues[1], currentDrumValues[2], currentDrumValues[3], currentDrumValues[4]];

        for (var i = 0; i < 5; i++) {
            if (dCopy[i] === sCopy[i]) {
                exactMatches++;
                sCopy[i] = 0; 
                dCopy[i] = -1;
            }
        }

        for (var i = 0; i < 5; i++) {
            if (dCopy[i] !== -1) {
                for (var j = 0; j < 5; j++) {
                    if (sCopy[j] === dCopy[i]) {
                        partialMatches++;
                        sCopy[j] = 0;
                        break;
                    }
                }
            }
        }

        var totalScore = 0;
        if (gameDifficulty === "easy") {
            totalScore = exactMatches * 20;
        } else {
            totalScore = (exactMatches * 20) + (partialMatches * 8);
        }

        if (totalScore > 100) totalScore = 100;

        var radar = document.getElementById('radarDisplay');
        
        if (exactMatches === 5) {
            radar.innerText = "УСПЕХ 100%";
            radar.style.color = "var(--radar-green)";
            setTimeout(function() {
                showScreen(casesScreen);
            }, 1000);
        } else {
            radar.innerText = "СИГНАЛ: " + totalScore + "%";
            if (totalScore >= 60) {
                radar.style.color = "var(--radar-green)";
            } else if (totalScore >= 30) {
                radar.style.color = "var(--radar-yellow)";
            } else {
                radar.style.color = "var(--radar-red)";
            }
        }
    });
};
