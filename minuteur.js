window.addEventListener("DOMContentLoaded", init);

let timeValue, timeSeconds;
let totalSec, totalMin;
let formatSec, formatMin;
let restartBtn, pauseBtn, backBtn;
let pausedTime, pausedSec, pausedMin;
let audioAlarm, audioTicTac;
let clockDigits;
let sec;

// fonction d'initialisation
function init(e) {
    window.removeEventListener("DOMContentLoaded", init);

    // création des raccourcis pour les éléments html
    startBtn = document.querySelector("#go");
    restartBtn = document.querySelector("#restart");
    pauseBtn = document.querySelector("#pause");
    backBtn = document.querySelector("#back");
    audioAlarm = document.querySelector("#alarm");
    audioTicTac = document.querySelector("#tictac");
    clockDigits = document.querySelector(".clock").querySelector("p");

    // récupération du temps à la sélection d'un bouton
    document.querySelectorAll(".radio-btn").forEach(btn => btn.addEventListener("click", getTime));

    // lancement du minuteur quand on clique sur démarrage
    startBtn.addEventListener("click", startTimer);
}

// récupération du temps si on choisit l'un des trois temps programmés
function getTime(e) {
    
    // sortie de la fonction si temps choisi librement 
    // (temps récupéré au lancement du minuteur et pas au clic sur le radio btn)
    if (e.target == document.querySelector("#timefree")) {
        timeValue = undefined;
        return;
    }

    // sinon, temps associé au bouton récupéré
    timeValue = e.target.value;
    console.log(timeValue);
    return timeValue;
}

// lancement du minuteur
function startTimer(e) {

    clockDigits.style.animationPlayState = "paused";
    startBtn.removeEventListener("click", startTimer);

    pauseBtn.addEventListener("click", pause);
    restartBtn.addEventListener("click", restart);
    backBtn.addEventListener("click", function() {document.location.reload(true);});

    // vérification du temps si pas pré-programmé  
    if (typeof timeValue == "undefined") {
        // récupéré si champ libre coché et contient une valeur entre 0 et 60
        if (document.querySelector("#timefree").checked 
        && (document.querySelector("#timefreefield").value <= 60) 
        && (document.querySelector("#timefreefield").value > 0)) {
            console.log("OUUUUf", document.querySelector("#timefreefield").value);
            timeValue = document.querySelector("#timefreefield").value;
        } // message d'alerte si valeur > 60
        else if (document.querySelector("#timefree").checked
        && (document.querySelector("#timefreefield").value > 60)) {
            alert("Ouhla ! On te conseille de choisir un temps inférieur à 60 min. C'est pour ton bien.");
            startBtn.addEventListener("click", startTimer);
            return;
        } // message d'alerte si valeur <= 0
        else if (document.querySelector("#timefree").checked
        && (document.querySelector("#timefreefield").value <= 0)) {
            alert("Cela risque de ne pas suffire. Choisis un temps supérieur à 0 min.");
            startBtn.addEventListener("click", startTimer);
            return;
        } // message d'alerte si pas de valeur choisie
        else {
            alert("Tu n'as pas choisi de temps de cuisson !");
            console.log("nope");
            startBtn.addEventListener("click", startTimer);
            return;
        }
    }

    // changement des boutons affichés
    document.querySelector(".start").style.display = "none";
    document.querySelector(".stop").style.display = "block";

    // conversion du temps choisi en secondes
    timeSeconds = timeValue*60;
    
    // lancement du tic tac
    audioTicTac.volume = 0.1;
    audioTicTac.play();

    // démarrage du décompte
    countdown(timeSeconds); 
}

// décompte des secondes
function countdown(total) {
    // fonction relancée à chaque seconde
    sec = window.setTimeout(function() { countdown(total); }, 1000);
    console.log("sec", total);

    // conversion du temps en secondes en minutes et secondes
    totalMin = Math.floor(total/60);
    totalSec = total - totalMin * 60;
    formatMin = ("0" + totalMin).slice(-2);
    formatSec = ("0" + totalSec).slice(-2);

    // affichage du temps restant
    clockDigits.innerHTML = `${formatMin}:${formatSec}`;
  
    // passage d'une seconde
    total--;

    // quand décompte terminé, lancement fonction fin du décompte
    if (total == 0) {
        window.setTimeout(function() { 
            clockDigits.innerHTML = `${formatMin}:${formatSec}`; 
            clearTimeout(sec);
            endCountdown();    
        }, 1000);
        return;
    }  
}

// fin du décompte : btn pause caché, alarme déclenchée, animation des nombres
function endCountdown() {
    console.log("c cuit");
    pauseBtn.style.display = "none";
    audioAlarm.play();
    audioTicTac.pause();
    clockDigits.style.animationPlayState = "running";
}

// bouton relancer
function restart() {
    restartBtn.removeEventListener("click", restart);

    // réinitialisation du bouton pause si le minuteur était en pause
    if (typeof pausedTime !== 'undefined') {
        pausedTime = undefined;
        pauseBtn.innerHTML = "Pause";
    }

    // réinitialisation du décompte et relancement de la fonction minuteur
    clearTimeout(sec);
    startTimer();
}

// bouton pause
function pause() {

    // impossible de mettre en pause si le décompte est terminé
    if (clockDigits.innerHTML == "00:00") {
        return;
    }
    
    // si déjà en pause, on reprend à partir du temps enregistré
    if (typeof pausedTime !== 'undefined') {
        console.log("on reprend");
        audioTicTac.play();
        countdown(pausedTime);
        pausedTime = undefined;
        pauseBtn.innerHTML = "Pause";
        return;
    } else {    // sinon, on pause et on récupère le temps
        pausedTime = clockDigits.innerHTML;
        // reconversion du temps affiché secondes pour pouvoir relancer le countdown
        pausedMin = parseInt(pausedTime.slice(0, 2), 10);
        pausedSec = parseInt(pausedTime.slice(3), 10);
        pausedTime = pausedMin*60 + pausedSec;
        // arrêt du décompte
        clearTimeout(sec);
        audioTicTac.pause();
        pauseBtn.innerHTML = "Reprendre";
        return;    
    }
}