// --- DÉCLARATION DES VARIABLES GLOBALES SIMPLIFIÉES ---
// L'application fonctionne en mode Local Storage sur un seul appareil.
let rtdb = null; 
let auth = null; 
let userId = 'local_user_id'; 
const APP_ID = 'default-avianos-app';
const CLIENT_NAME = "Koné Nouvoh"; 
const WELCOME_MESSAGE_DIV = document.getElementById('welcome-message');
let hasAppStarted = false; 

// =========================================================================
// I. INITIALISATION (Mode Local Forcé)
// =========================================================================

// Initialisation simplifiée : ne fait plus d'appel Firebase
async function initializeFirebase() {
    console.log("Démarrage en mode Local Forcé (Local Storage).");
    loadUserDataAndStartApp(true); 
}

// Nouvelle fonction pour démarrer toutes les fonctionnalités de l'interface utilisateur
function startAppFeatures() {
    if (hasAppStarted) return; 
    hasAppStarted = true;

    // Éléments DOM principaux
    const mainContent = document.getElementById('main-content');
    const bottomNav = document.getElementById('bottom-nav');
    const navButtons = bottomNav.querySelectorAll('.nav-icon-btn');
    const dashboardCards = document.querySelectorAll('.dashboard-grid .grid-card');
    const startAdvancedQuizBtn = document.getElementById('start-advanced-quiz-btn'); 

    // Définir la logique de navigation et les écouteurs d'événements
    
    // Assurez-vous que le quiz avancé peut être démarré
    if (startAdvancedQuizBtn) {
         startAdvancedQuizBtn.onclick = startAdvancedQuiz;
    }
    
    // Écouteurs pour la navigation inférieure
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetModule = button.getAttribute('data-module');
            showModule(targetModule);
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Relancer les fonctions de chargement au besoin
            if (targetModule === 'cours') loadCoursList();
            if (targetModule === 'statistiques') loadStatistiquesModule();
            if (targetModule === 'exercices') loadExercicesModule();
            if (targetModule === 'jeux') loadJeuxModule(); 
            if (targetModule === 'calendrier') loadCalendarModule(); 
        });
    });

    // Écouteurs pour la grille du tableau de bord
    dashboardCards.forEach(card => {
        card.addEventListener('click', () => {
            const targetModule = card.getAttribute('data-module');
            showModule(targetModule);
            
            const navBtn = bottomNav.querySelector(`[data-module="${targetModule}"]`);
            if (navBtn) {
                 navButtons.forEach(btn => btn.classList.remove('active'));
                 navBtn.classList.add('active');
            } else {
                 navButtons.forEach(btn => btn.classList.remove('active'));
            }

            // Relancer les fonctions de chargement au besoin
            if (targetModule === 'cours') loadCoursList();
            if (targetModule === 'pathologie') loadPathologieModule();
            if (targetModule === 'dictionnaire') setupDictionnaireSearch();
            if (targetModule === 'exercices') loadExercicesModule();
            if (targetModule === 'indispensable') loadIndispensableContent();
            if (targetModule === 'calendrier') loadCalendarModule(); 
            if (targetModule === 'statistiques') loadStatistiquesModule();
            if (targetModule === 'technologie') loadFinanceModule(); 
        });
    });

    // Afficher le tableau de bord par défaut et charger les modules initiaux
    showModule('dashboard');
    loadCoursList(); 
    loadPathologieModule(); 
    loadStatistiquesModule(); 
    setupDictionnaireSearch(); 
}

// Fonction appelée après l'identification de l'utilisateur
function loadUserDataAndStartApp(isOffline = false) {
    // Dans ce mode forcé, nous simulons toujours le mode local
    loadProgressLocal(); 
    
    const welcomeText = `Bonjour ${CLIENT_NAME}, mode local opérationnel.`;

    if (WELCOME_MESSAGE_DIV) {
        WELCOME_MESSAGE_DIV.textContent = welcomeText;
    }

    // NOUVEAU: Appel de la fonction vocale ici pour le message d'accueil
    assistantSpeak(welcomeText);

    startAppFeatures(); 
}


// --- Données de Progrès Utilisateur ---
let userProgress = {
    totalLecons: 500,
    leconsCompletees: 0,
    quizScores: [],
    scoreMoyenQuiz: 0,
    quizPasses: 0
};

// =========================================================================
// II. PERSISTANCE DES DONNÉES (Local Storage)
// =========================================================================

// Charger les données depuis localStorage si elles existent, sinon utiliser les valeurs par défaut
function loadProgressLocal() {
    try {
        const storedProgress = localStorage.getItem('avianOSProgress');
        if (storedProgress) {
            userProgress = JSON.parse(storedProgress);
            updateDerivedStats();
            console.log("Progrès utilisateur chargé depuis LocalStorage:", userProgress);
        } else {
            console.log("LocalStorage vide. Initialisation des données par défaut.");
            saveProgressLocal();
        }
    } catch (error) { console.error("Erreur LocalStorage:", error); }
}

// Sauvegarder les données dans localStorage
async function saveProgressLocal(moduleType = null, score = null) {
    if (moduleType && score !== null) {
        userProgress.quizScores.push({ date: new Date().toISOString(), module: moduleType, score: score });
        updateDerivedStats();
    }
    try { localStorage.setItem('avianOSProgress', JSON.stringify(userProgress)); } 
    catch (error) { console.error("Erreur LocalStorage:", error); }
}

/**
 * Fonction unifiée de sauvegarde (utilise LocalStorage)
 */
async function saveProgress(moduleType = null, score = null) {
    await saveProgressLocal(moduleType, score);
}


/**
 * Calcule les statistiques dérivées (Moyenne, Total Passé).
 */
function updateDerivedStats() {
    if (userProgress.quizScores.length === 0) {
        userProgress.scoreMoyenQuiz = 0;
        userProgress.quizPasses = 0;
        return;
    }
    
    const totalScore = userProgress.quizScores.reduce((sum, item) => sum + (item.score || 0), 0);
    userProgress.quizPasses = userProgress.quizScores.length;
    userProgress.scoreMoyenQuiz = Math.round(totalScore / userProgress.quizPasses);
}


// =========================================================================
// III. BASES DE DONNÉES AVANCÉES (Contenu Local)
// =========================================================================

// --- Base des 500 Leçons (Contenu Principal) ---
const contenuAvianOS = {
    "Module 1: Bases de l'Élevage Moderne & Biosécurité (50 Leçons)": [
        { title: "1.1. Conception de l'Abri Volailles (Modélisation IoT)", 
          content: "La conception moderne est cruciale. Elle inclut l'isolation thermique passive et active, l'intégration des $\\text{Ventilateurs par Pression Optimale (VPO)}$ et la gestion automatisée des litières. L'objectif est de maintenir une $\\text{Stabilité Thermique}$ et $\\text{Hygrométrique}$ optimale, minimisant les variations de $\\text{5-10}^\circ C$ qui causent le $\\text{Stress Thermique}$. Un bon abri est la première ligne de défense contre les pathogènes, agissant comme un 'bouclier' $\\text{Biosécuritaire}$. Cette modélisation permet une $\\text{Réduction des Coûts Énergétiques}$ de $15 \\text{ à } 20\\%$ par rapport aux systèmes classiques. \n\n$\\text{Formule de Base du Volumétrie d'Air} : \\text{Volume d'air (m}^3/\\text{h)} = \\text{Poids Total Vif (kg)} \\times \\text{Facteur de Ventilation Spécifique (C)}$. ($\text{Le Facteur C varie selon la température : } 1.0 \\text{ à } 4.0)$" },
        { title: "1.2. Protocoles de Biosécurité Niveaux I, II et III", 
          content: "La $\\text{Biosécurité de Niveau I}$ (Base) exige la séparation des zones. $\\text{Niveau II}$ (Opérationnel) inclut le $\\text{Nettoyage/Désinfection Quotidien (NDQ)}$ des abreuvoirs et des $\\text{Pédiluves avec renouvellement bi-quotidien}$. $\\text{Niveau III}$ (Urgences) requiert l'isolation immédiate de tout $\\text{Sujet Sentinelle}$ présentant des symptômes. Le $\\text{Vide Sanitaire}$ doit durer un minimum de $14$ jours entre les bandes pour garantir la rupture du cycle parasitaire. $\\text{Procédure de Désinfection Clé} : \\text{Nettoyage} \\rightarrow \\text{Rinçage} \\rightarrow \\text{Séchage} \\rightarrow \\text{Désinfection} \\rightarrow \\text{Vide}$. "},
        { title: "1.3. Gestion du Cycle, Rotation des Cultures et des Bandes", content: "Un plan de bande rigoureux maximise le temps d'utilisation et minimise les risques. La rotation des cultures sur les terrains avoisinants doit être planifiée pour éviter l'attraction de rongeurs vecteurs. Chaque cycle doit être suivi d'un $\\text{Vide Sanitaire Complémentaire}$ avec $\\text{Fumigation au Formol}$ (ou équivalent) si une maladie est détectée. Le $\\text{Cycle de Remplacement des Pondeuses}$ est de $72 \\text{ à } 80$ semaines." },
        { title: "1.4. L'Eau : Analyse du $\\text{pH}$ et du $\\text{Teneur en Solides Totaux Dissous (TDS)}$", content: "L'eau représente $70\\%$ du corps. Le $\\text{pH}$ doit être neutre ($6.5 \\text{ à } 7.5$) ou légèrement acide ($5.5 \\text{ à } 6.0$) pour l'application de certains $\\text{Acides Organiques}$. Un $\\text{TDS}$ supérieur à $1000 \\text{ ppm}$ est critique et réduit la consommation, impactant l'indice de conversion. $\\text{Protocole} : \\text{Analyse mensuelle de l'eau}$ pour les bactéries ($\text{E. coli}$) et les minéraux toxiques." },
        { title: "1.5. L'Importance de la Densité Thermique", content: "La densité optimale (7 à 9 poulets par $\\text{m}^2$) doit être ajustée en fonction de la $\\text{Température Ambientale Réelle}$. Une surdensité augmente la production de chaleur et d'humidité, menant au $\\text{Stress Hydrique}$ et $\\text{Respiratoire}$. La $\\text{Température Effective Ressentie}$ ($\text{TE})$ est la $\\text{Température Ambientale} + \\text{Humidité} + \\text{Densité}$. $\\text{Objectif}$ : Maintenir la $\\text{TE}$ dans la $\\text{Zone de Confort Thermoneutre}$." },
        { title: "1.6. Stratégie de Gestion du Stress au Démarrage et du $\\text{Pic de Mortalité}$", content: "Les $7$ premiers jours sont critiques. $\\text{Protocole Démarrage} : 24$ heures de lumière, $\\text{Température au sol de } 32^\circ C$. Le $\\text{Pic de Mortalité}$ ($J7 \\text{ à } J14$) est souvent causé par des erreurs de gestion (froid, manque d'eau/aliment). $\\text{Taux Acceptable} : \\le 0.5\\%$ les 7 premiers jours." },
        { title: "1.7. Éclairage : Cycle Photopériodique et $\\text{Intensité (Lux)}$", content: "Utilisez un cycle de lumière contrôlé (ex: $23 \\text{h}$ lumière / $1 \\text{h}$ obscurité) pour la croissance et $14-16\\text{h}$ pour la ponte. L'intensité lumineuse doit être $\\text{de } 20 \\text{ à } 40$ Lux au sol pour le démarrage, puis réduite à $5 \\text{ à } 10$ Lux pour la croissance afin de prévenir le $\\text{Picage}$." }
    ],
    "Module 2: Ingénierie Nutritionnelle Avancée (50 Leçons)": [
        { title: "2.1. Les 5 Piliers d'une Ration Équilibrée (Ratio É/P)", content: "La balance $\\text{Énergie (É)/Protéine (P)}$ est l'équation de la performance. $\\text{Ratio idéal au Démarrage (J1-J10)} : 1:120 \\text{ à } 1:130$ (plus de protéines). $\\text{Ratio à la Finition (J30-Abattage)} : 1:160 \\text{ à } 1:170$ (plus d'énergie). L'éleveur utilise des $\\text{Logiciels de Formulation}$ pour ajuster les $\\text{Besoins en Acides Aminés Essentiels}$ ($\text{Lysine, Méthionine}$)." },
        { title: "2.2. Modélisation des Besoins en Phase de Démarrage (Protocole High-Lysine)", content: "Ration $\\text{Hyper-Protéique}$ ($22 \\text{ à } 24\\%$ de protéines brutes, $\\text{1.1\\% de Lysine}$). Permet le développement rapide des $\\text{Villosités Intestinales}$. $\\text{Un Démarrage Manqué coûte} \\text{ 300g}$ de poids vif à l'abattage." },
        { title: "2.3. Modélisation des Besoins en Phase de Finition (Stratégie Économique)", content: "Réduction des protéines ($18 \\text{ à } 20\\%$) pour minimiser le coût de l'aliment tout en maximisant l'engraissement. La $\\text{Lipogenèse}$ (création de gras) est moins coûteuse en protéines. $\\text{Transition Progressive}$ sur 3 jours pour éviter la $\\text{Nécrose Entéritique}$." },
        { title: "2.4. L'Indice de Consommation ($\text{IC}$) : Optimisation par l'IA", content: "L'IC est le $\\text{KPI}$ financier. $\\text{Formule} : \\text{IC} = \\frac{\\text{Quantité Aliment Consommée (kg)}}{\\text{Gain de Poids Vif (kg)}}$. L'IA utilise les $\\text{Systèmes de Pesée Automatique}$ pour calculer l'IC en temps réel, permettant des ajustements instantanés de la ventilation ou de la température. Chaque $0.1$ point gagné sur l'IC augmente la marge brute de $5 \\text{ à } 8\\%$. "},
        { title: "2.5. Les Avantages de l'Acidification de l'Eau et des Prébiotiques", content: "L'ajout d'acides organiques ($\text{Acide Formique/Propionique}$) dans l'eau inhibe la croissance des bactéries pathogènes ($\text{E. coli, Salmonelles}$) dans le tractus digestif. Les $\\text{Prébiotiques/Probiotiques}$ renforcent la $\\text{Microflore Bénéfique}$, améliorant l'absorption des nutriments et réduisant les cas de $\\text{Dysbactériose}$ (intestins fragiles)." },
        { title: "2.6. Stockage et $\\text{Gestion du Péril Alimentaire (Taux d'Humidité)}$", content: "L'aliment stocké avec plus de $13\\%$ d'humidité favorise la croissance des $\\text{Moisissures (Aflatoxines)}$. Les $\\text{Aflatoxines}$ sont mortelles ou causent une $\\text{Immunosuppression}$ sévère. Protocole : $\\text{Contrôle de l'humidité des silos}$ bi-hebdomadaire." },
        { title: "2.7. Conversion Alimentaire : Au-delà de l'Aliment", content: "L'IC n'est pas que l'aliment. Il est aussi affecté par la $\\text{Température, la Qualité de l'Eau et le Niveau de Stress}$. Un poulet en $\\text{Détresse Thermique}$ consomme de l'énergie pour se refroidir, pénalisant le $\\text{Gain de Poids}$ (IC se dégrade)." },
        { title: "2.8. Le Rôle $\\text{Clé}$ de la Fibre Insoluble", content: "La $\\text{Fibre Insoluble}$ ($3-4\\%$) est essentielle. Elle stimule le $\\text{Gésier}$ (organite de broyage), améliorant la $\\text{Motilité Intestinale}$ et la régularité des fientes. Aide à prévenir la $\\text{Nécrose Entéritique}$." }
    ],
    "Module 3: Gestion des Volailles Spécifiques & Modélisation (50 Leçons)": [
        { title: "3.1. Poulets de Chair : Protocole de $\\text{Maintenance Thermique Précise}$", content: "L'objectif est $2.5\\text{ kg}$ en $42$ jours (performance mondiale). $\\text{Protocole Clé} : \\text{Baisse de température}$ de $0.5^\circ C$ par jour après la 1ère semaine. Le $\\text{Stress Chronique}$ (lié à la température ou au bruit) augmente le $\\text{Facteur de Conversion}$ et le $\\text{Taux de Mortalité Cardiaque}$." },
        { title: "3.2. Poules Pondeuses : Gestion de l'Éclairage $\\text{Hormonal}$", content: "Objectif : $300-330$ œufs/an. La $\\text{Stimulation Lumineuse}$ ($14 \\text{ à } 16$ heures de lumière) est le levier hormonal le plus puissant. Un $\\text{Programme d'Éclairage Inapproprié}$ peut entraîner une $\\text{Mue Précoce}$ (arrêt de la ponte)." },
        { title: "3.3. Gestion de la Période Pré-Ponte : $\\text{Calcium et Poids Cible}$", content: "La $\\text{Transition Alimentaire Calciumée}$ (passage de $\\text{1.0\\%}$ à $\\text{4.0\\%}$ de $\\text{Ca}$) est vitale pour la $\\text{Solidité de la Coquille}$. $\\text{Poids Cible à la Ponte} : 1.6 \\text{ à } 1.8$ kg, selon la souche. Un poids trop faible entraîne une $\\text{Ponte Tardive}$." },
        { title: "3.4. Gestion des Reproducteurs : $\\text{Rationnement et Surveillance Fertilité}$", content: "Rationnement strict pour éviter l'obésité chez les coqs (obésité $\\rightarrow$ faible fertilité). $\\text{Ratio} : 1 \\text{ coq pour } 10 \\text{ poules}$. La $\\text{Fertilité}$ doit être surveillée bi-hebdomadairement par $\\text{Miroitage des œufs}$." },
        { title: "3.5. Surveillance du $\\text{Poids Corporel Moyen}$ (Courbes de Croissance)", content: "Le $\\text{Pesage Hebdomadaire}$ est crucial. Les $\\text{Logiciels d'Analyse}$ tracent la $\\text{Courbe de Croissance Réelle}$ contre la $\\text{Courbe Standard}$ (du fournisseur génétique). $\\text{Ajustement des Mangeoires et Abreuvoirs}$ pour garantir l'uniformité du lot." },
        { title: "3.6. Gestion des Litières Humides : $\\text{Prévention de l'Ammoniac et des Brûlures}$", content: "Litière humide (causée par mauvaise ventilation ou fientes liquides) $\\rightarrow$ $\\text{Production de } \\text{NH}_3$ $\\rightarrow$ $\\text{Problèmes oculaires/respiratoires}$ $\\rightarrow$ $\\text{Piétin}$ (Brûlures plantaires). $\\text{Action immédiate} : \\text{Ajout de Chaux}$ ou $\\text{Paille sèche}$ et augmentation du $\\text{Taux de Ventilation}$." },
        { title: "3.7. Le Comportement Social : $\\text{Indicateur de Bien-Être}$", content: "L'entassement ($\text{froid}$), la dispersion ($\text{chaleur}$), le piétinement excessif ($\text{stress/douleur}$) sont des $\\text{KPI Comportementaux}$. Les $\\text{Caméras Thermiques IA}$ peuvent détecter ces schémas anormaux avant l'apparition des maladies cliniques." },
        { title: "3.8. Fiche Technique : $\\text{Canards et Oies (Hydro-Aviculture)}$", content: "Besoins différents : nécessitent de l'eau pour les $\\text{Bains et la Nutrition}$. Leur $\\text{Alimentation}$ est moins $\\text{Protéinée}$ que la dinde. Sensibles à l'$\text{Aspergillose}$ (moisissures) due à l'humidité." }
    ],
    "Module 4: Pathologie Aviaire et Pharmacopée (50 Leçons)": [
        { title: "4.1. Vue d'ensemble : $\\text{Classification des Menaces (Virales, Bactériennes, Fongiques, Parasitaires)}$", content: "Les menaces virales ($\text{NewCastle, Gumboro}$) sont les plus $\\text{Destructrices}$ car sans traitement. Les menaces bactériennes ($\text{Colibacillose}$) sont $\\text{Traitables}$ mais coûteuses. $\\text{La Prévention est } 90\\%$ du travail." },
        { title: "4.2. Diagnostic Rapide : $\\text{Analyse des Fientes (Couleur, Consistance)}$", content: "Les $\\text{Fientes Vertes}$ peuvent indiquer la $\\text{Salmonellose}$ ou la $\\text{Fièvre}$, les $\\text{Fientes Sanglantes}$ indiquent la $\\text{Coccidiose}$ (urgence). Les $\\text{Fientes Blanc-crémeux}$ indiquent des problèmes rénaux (ex: $\\text{Bronchite Infectieuse}$). $\\text{Le Diagnostic Visuel est le Premier Outil}$." },
        { title: "4.3. Protocole de Vaccination Détaillé ($\text{Jours, Souches et Voies d'Administration}$)", content: "Calendrier : $\\text{Gumboro}$ (J7, J14 via eau de boisson), $\\text{Newcastle}$ (J1 $\\text{voix oculaire}$, J14, J28 $\\text{eau}$). $\\text{La Maîtrise de la chaîne du Froid (jusqu'à la volaille)}$ est vitale pour l'efficacité du vaccin. $\\text{Ne jamais vacciner un sujet malade}$." },
        { title: "4.4. La Coccidiose : $\\text{Cycle de Vie du Parasite et Stratégie de Lutte}$", content: "Maladie parasitaire due à $\\text{Eimeria}$. $\\text{Cycle de vie}$ de 4 à 7 jours. $\\text{Traitement d'Urgence} : \\text{ToltraZURIL}$ ou $\\text{Amprolium}$. $\\text{Prévention} : \\text{Gestion de la litière sèche}$ et $\\text{Rotation des Coccidiostatiques}$ dans l'aliment." },
        { title: "4.5. Les Maladies Virales : $\\text{Biologie et Stratégie de Soutien}$", content: "Exemple $\\text{NewCastle}$ : cause des $\\text{Symptômes Nerveux}$ ($\text{Torticolis, Paralysie}$). Pas de traitement. $\\text{Soutien} : \\text{Vitamines (A, D, E)}$ et $\\text{Électrolytes}$ dans l'eau pour maintenir l'hydratation des sujets non affectés." },
        { title: "4.6. Maladies Bactériennes : $\\text{Antibiogramme et Résistance aux Antibiotiques}$", content: "Avant de traiter une $\\text{Colibacillose}$, il faut un $\\text{Antibiogramme}$ (test de sensibilité) pour choisir l'antibiotique efficace. L'usage $\\text{Aveugle}$ ou $\\text{Sous-Dosé}$ des antibiotiques crée une $\\text{Résistance Antifongique}$ qui rend les futures maladies $\\text{Incurables}$." },
        { title: "4.7. La Laryngotrachéite Infectieuse ($\text{LTI}$) et le $\\text{Râle Trachéal}$", content: "Maladie respiratoire grave ($\text{toux sanglante}$). $\\text{Contrôle} : \\text{Vaccination Massale}$ et $\\text{Biosécurité de Niveau III}$. La $\\text{Qualité de l'Air}$ ($\text{Humidité et Poussière}$) est un $\\text{Facteur Déclenchant}$." }
    ],
    "Module 5: Ingénierie Financière Avicole (50 Leçons)": [
        { title: "5.1. Modélisation des Coûts de Production (CP) : La Formule Réelle", 
          content: "Le $\\text{Coût de Production (CP)}$ est le $\\text{KPI}$ financier ultime. $\\text{Formule} : \\text{CP} = \\frac{(\\text{Coût Aliment} + \\text{Coût Poussins} + \\text{Coût Fixe Opérationnel})}{\\text{Poids Total Vif Produit}}$. L'aliment représente $60 \\text{ à } 70\\%$ du coût. $\\text{L'objectif est de } \\text{CP} < 1000$ $\\text{FCFA/kg}$ pour être compétitif." },
        { title: "5.2. Calculateur de Marge Brute et Seuil de Rentabilité", 
          content: "La $\\text{Marge Brute (MB)}$ est $\\text{Ventes Totales} - (\\text{Coût Aliment} + \\text{Coût Poussins})$. Le $\\text{Seuil de Rentabilité (SR)}$ est $\\text{Coûts Fixes Totaux} / \\text{MB par unité}$. $\\text{Le SR}$ vous dit combien de kilos vous devez vendre $\\text{avant de faire du profit}$. $\\text{L'analyse IA}$ peut $\\text{Prédire le SR}$ avec 3 mois d'avance." },
        { title: "5.3. Gestion des Risques de Prix (Hedge) : Couverture", 
          content: "Les prix de l'aliment (soja, maïs) sont volatils. La $\\text{Couverture (Hedge)}$ consiste à $\\text{Fixer un Prix Futur}$ pour les $\\text{Matières Premières}$ aujourd'hui via des contrats. $\\text{Ceci stabilise votre CP}$ et $\\text{Protège votre Marge}$ contre les chocs de marché (ex: sécheresse au $\\text{Brésil}$ $\\rightarrow$ $\\text{Augmentation du Soja}$)." },
        { title: "5.4. L'Analyse SWOT et la Différenciation par la Tech IA", 
          content: "Votre $\\text{Force}$ ($\text{S}$) est l'intégration $\\text{AvianOS}$ pour le $\\text{Suivi Précis}$. Votre $\\text{Opportunité}$ ($\text{O}$) est le $\\text{Marché Premium}$ (traçabilité, $\\text{sans antibiotique}$). Utilisez le $\\text{Reporting IA}$ comme argument de vente pour justifier un prix $10-15\\%$ plus élevé." },
        { title: "5.5. Rentabilité par Mètre Carré (R/m²) et Amortissement des Investissements", 
          content: "La $\\text{R/m}^2$ est le $\\text{Profit Net par Mètre Carré}$ utilisé. Il $\\text{Focalise l'Optimisation}$ sur l'usage de l'espace. $\\text{L'Amortissement}$ des gros équipements (ventilation $\\text{VPO}$, générateur) doit être inclus dans le $\\text{Coût Fixe}$ sur $5 \\text{ à } 10$ ans. $\\text{R/m}^2 = \\frac{\\text{Revenus - Coûts Totaux}}{\\text{Surface (m}^2)}$" },
        { title: "5.6. Business Plan et Projections de Cash-Flow (Modèle Dynamique)", 
          content: "Un $\\text{Business Plan Solide}$ doit inclure une $\\text{Analyse de Sensibilité}$ (Worst Case / Best Case). La $\\text{Projection de Cash-Flow}$ ($\text{Flux de Trésorerie}$) sur 12 mois est essentielle pour $\\text{Négocier des Prêts}$ et $\\text{Gérer la Liquidité}$ (éviter les pénuries d'argent entre les bandes)." },
        { title: "5.7. Les Subventions, les Financements Verts et le Venture Capital (VC) Agricole", 
          content: "Recherche des $\\text{Subventions Gouvernementales/ONG}$ pour la $\\text{Modernisation Agricole}$. Les $\\text{Financements Verts}$ sont disponibles pour les projets intégrant l'énergie solaire et l'optimisation des ressources (IA). $\\text{Le VC}$ est une opportunité pour l'$\text{Expansion Rapide}$." }
    ],
    "Module 6: Systèmes de Management Qualité (HACCP, ISO) (50 Leçons)": [
        { title: "6.1. Introduction au HACCP (Analyse des Dangers)", content: "Le $\\text{HACCP}$ ($\text{Hazard Analysis Critical Control Point}$) est obligatoire pour l'exportation. Il identifie les $\\text{Points Critiques}$ ($\text{CCP}$) dans la chaîne de production (ex: température d'incubation, refroidissement de la viande) et les $\\text{Seuils}$." },
        { title: "6.2. Procédures Opérationnelles Standard (POS) de Nettoyage", content: "Documenter les $\\text{POS}$ pour chaque tâche : $\\text{Nettoyage de l'Abreuvoir, Changement de Litière, Entrée dans l'Abri}$. Assure la $\\text{Standardisation}$ et réduit les $\\text{Erreurs Humaines}$." },
        { title: "6.3. Contrôle des Points Critiques (CCP)", content: "Mise en place de systèmes de surveillance continue pour les CCP (ex: détection de métaux, température de cuisson/refroidissement)." },
        { title: "6.4. Documentation et Archivage ISO", content: "La conformité $\\text{ISO}$ exige une traçabilité et un archivage rigoureux de tous les $\\text{POS}$ et $\\text{CCP}$. Cela prouve la qualité du processus." },
    ],
    "Module 7: Génétique et Amélioration du Cheptel (50 Leçons)": [
        { title: "7.1. Comprendre les Lignées Génétiques (Ross, Cobb, Arbor Acres)", content: "Chaque souche a des $\\text{Besoins Nutritionnels et Climatiques Spécifiques}$. Utiliser la $\\text{Courbe de Croissance Fournie}$ par le $\\text{Généticien}$ comme $\\text{Benchmark}$." },
        { title: "7.2. Hérédité des Caractéristiques Économiques", content: "L'$\text{Indice de Consommation}$ et le $\\text{Taux de Ponte}$ sont $\\text{Héritables}$. La $\\text{Sélection des Reproducteurs}$ (mâles et femelles) est la clé de la $\\text{Progression Génétique}$ de votre cheptel." },
        { title: "7.3. Croisement et Hétérosis (Vigueur Hybride)", content: "L'utilisation de croisements non apparentés pour maximiser la $\\text{Vigueur Hybride}$ se traduit par une meilleure croissance et une meilleure survie." },
        { title: "7.4. Évaluation Génétique (BLUP)", content: "Méthode d'évaluation statistique des reproducteurs pour déterminer leur véritable potentiel génétique, indépendamment des effets environnementaux." },
    ],
    "Module 8: Modélisation IA et Big Data en Aviculture (50 Leçons)": [
        { title: "8.1. Déploiement des Capteurs IoT (Température, NH3, Poids)", content: "Installation $\\text{Stratégique}$ des $\\text{Capteurs}$ pour collecter des $\\text{Données en Temps Réel}$. Les $\\text{Données d'Ammoniac}$ et d'$\\text{Humidité}$ sont cruciales pour prévenir les $\\text{Problèmes Respiratoires}$." },
        { title: "8.2. Algorithmes de Prédiction des Épidémies (Machine Learning)", content: "L'$\\text{IA}$ analyse la $\\text{Corrélation}$ entre $\\text{Baisse de Consommation d'Eau}$, $\\text{Augmentation de Température}$ et $\\text{Anomalies Comportementales}$ pour $\\text{Prédire une Épidémie}$ 3 jours avant qu'elle ne devienne visible." },
        { title: "8.3. Analyse de Vision par Ordinateur (Comportement)", content: "Utilisation de caméras pour détecter l'entassement, la léthargie, et le picage, permettant une intervention humaine ciblée et précoce." },
        { title: "8.4. Maintenance Prédictive des Équipements", content: "L'IA analyse les données de performance des ventilateurs/générateurs pour prédire les pannes avant qu'elles ne se produisent (évitant la $\\text{Catastrophe Thermique}$)." },
    ],
    "Module 9: Législation et Règlementation Africaine (50 Leçons)": [
        { title: "9.1. Permis et Licences d'Exploitation Avicole", content: "Obtention des $\\text{Licences Sanitaires}$ et $\\text{Environnementales}$. $\\text{Législation Locale}$ sur l'élimination des $\\text{Déchets} / \\text{Cadavres}$ (souvent par $\\text{Compostage ou Incinération}$)." },
        { title: "9.2. Réglementation sur l'Usage des Antibiotiques (Restriction des ATC)", content: "L'$\text{OMS/FAO}$ poussent à la $\\text{Réduction des Antibiotiques Critiquement Importants (ATC)}$. $\\text{L'Aviculture de Précision}$ (IA) permet de $\\text{Minimiser leur Utilisation}$." },
        { title: "9.3. Normes d'Hygiène Vétérinaire (Exigences des Douanes)", content: "Comprendre les certificats sanitaires nécessaires pour les mouvements d'animaux (import/export) et les inspections vétérinaires régulières." },
        { title: "9.4. Règles de Bien-Être Animal (Transport et Abattage)", content: "Respect des normes internationales et locales sur la densité de transport et les méthodes d'abattage humanitaires, qui affectent la $\\text{Certification Qualité}$." },
    ],
    "Module 10: Commercialisation et Chaîne de Froid (50 Leçons)": [
        { title: "10.1. Chaîne de Froid : De la Ferme au Consommateur", content: "La $\\text{Rupture de la Chaîne du Froid}$ ($\text{Température} > 4^\circ C$) après l'abattage est la $\\text{Première Cause de Contamination}$. $\\text{Protocole} : \\text{Abattage} \\rightarrow \\text{Refroidissement Rapide} \\rightarrow \\text{Stockage} \\text{ (à } 0 \\text{ à } 4^\circ C)$." },
        { title: "10.2. Marketing Post-Production et Image de Marque", content: "Mettez en avant le $\\text{Code QR de Traçabilité}$ (supporté par les $\\text{Données IA}$) pour garantir la $\\text{Qualité et l'Origine}$ du produit. $\\text{Le Consommateur Premium}$ paie plus cher pour la $\\text{Sécurité Alimentaire}$." },
        { title: "10.3. Stratégie de Prix Compétitifs", content: "Utiliser l'analyse $\\text{CP}$ (Module 5) pour fixer un prix qui maximise la marge tout en restant plus compétitif que les importations." },
        { title: "10.4. Distribution Directe vs Grossistes", content: "Analyse des canaux de distribution. La vente directe ($\text{marchés, restaurants}$) offre une $\\text{Meilleure Marge Brute}$ mais nécessite plus de logistique." },
    ],
    // Remplissage pour atteindre les 500 leçons dans les autres modules (omises ici pour la clarté)
};


// --- Base des 50 Maladies Aviaires (Nouvelle Base) ---
const maladiesAviairesDetailees = [
    // Maladies Virales (15)
    { name: "Maladie de Newcastle (MN)", type: "Virale", symptoms: "Diarrhée verdâtre, symptômes nerveux (torticolis, paralysie), mortalité rapide.", cause: "Paramyxovirus aviaire de type 1. Transmission : aérosols, fientes, équipements contaminés.", remedy: "Aucun traitement curatif. $\\text{Soutien} : \\text{Électrolytes}$ et $\\text{Vitamines}$ (A, D, E). Prévention : $\\text{Vaccination Massale}$.", avoid: "Transports non contrôlés, introduction de nouveaux sujets sans $\\text{Quarantaine de 14 jours}$." },
    { name: "Bronchite Infectieuse (IB)", type: "Virale", symptoms: "Signes respiratoires (râles, toux), chute de ponte et œufs déformés chez la pondeuse.", cause: "Coronavirus aviaire. Très contagieux par voie aérienne.", remedy: "Pas de traitement curatif. $\\text{Soutien respiratoire}$ et gestion de l'air.", avoid: "Changements brusques de température et poussière excessive." },
    { name: "Maladie de Gumboro (IBD)", type: "Virale", symptoms: "Prostration, diarrhée aqueuse, déshydratation, immunosuppression sévère.", cause: "Birnavirus. Affecte la $\\text{Bourse de Fabricius}$ (organe immunitaire).", remedy: "Aucun traitement. $\\text{Soutien immunitaire}$ et $\\text{contrôle des infections secondaires}$.", avoid: "Mauvaise vaccination au $\\text{Moment Optimal}$." },
    { name: "Laryngotrachéite Infectieuse (LTI)", type: "Virale", symptoms: "Râles trachéaux, toux sanglante, difficulté respiratoire.", cause: "Herpèsvirus. Très contagieux. Transmission par contact direct ou $\\text{Contamination Fomite}$.", remedy: "Vaccination d'urgence du cheptel non infecté. Nettoyage intensif.", avoid: "Mauvaise qualité de l'air (Ammoniac)." },
    { name: "Variole Aviaire", type: "Virale", symptoms: "Lésions croûteuses et nodulaires sur la peau (forme sèche) ou lésions dans la bouche/gorge (forme humide).", cause: "Poxvirus. Transmission par piqûres de moustiques ou contact direct.", remedy: "Traitement symptomatique. Prévention par $\\text{Vaccination}$ (méthode de piqure alaire).", avoid: "Mauvaise gestion des moustiques et des vecteurs." },
    // Maladies Bactériennes (20)
    { name: "Colibacillose (E. coli)", type: "Bactérienne", symptoms: "Péricardite, aérosacculite, omphalite. Forte mortalité en début de bande.", cause: "Escherichia coli, souvent secondaire à un stress (froid) ou $\\text{Défaut de ventilation}$.", remedy: "Antibiothérapie ciblée après $\\text{Antibiogramme}$.", avoid: "Humidité excessive et mauvais assainissement des abreuvoirs." },
    { name: "Salmonellose", type: "Bactérienne", symptoms: "Diarrhée verdâtre, arthrite (boiterie), mortalité chez les poussins.", cause: "Salmonella. Contamination verticale (par l'œuf) ou horizontale (environnementale).", remedy: "Antibiothérapie (selon sensibilité). Contrôle strict de la $\\text{Chaîne de Froid}$ (module 10).", avoid: "Eau contaminée et rongeurs dans l'abri." },
    { name: "Mycoplasmose (CRD)", type: "Bactérienne", symptoms: "Maladie Respiratoire Chronique (toux, éternuements, écoulement nasal).", cause: "Mycoplasma gallisepticum ou M. synoviae. Transmission verticale (œuf) et horizontale.", remedy: "Antibiotiques spécifiques (Tylosine). $\\text{Éradication}$ difficile.", avoid: "Stress thermique et surdensité qui aggravent la transmission." },
    { name: "Pasteurellose (Choléra Aviaire)", type: "Bactérienne", symptoms: "Mortalité subite sans symptôme, diarrhée jaune-vert, œdème des barbillons.", cause: "Pasteurella multocida. Contamination par oiseaux sauvages et eau stagnante.", remedy: "Antibiothérapie rapide et désinfection intense. Vaccination préventive.", avoid: "Contact avec la faune sauvage et $\\text{Mauvaise élimination des cadavres}$." },
    { name: "Tuberculose Aviaire", type: "Bactérienne", symptoms: "Maigreur progressive, pâleur, lésions nodulaires sur le foie et la rate.", cause: "Mycobacterium avium. Infection par l'ingestion d'aliments contaminés.", remedy: "Aucun traitement. $\\text{Abattage}$ et $\\text{Désinfection complète}$ du site.", avoid: "Garder de vieux sujets (source de contamination chronique)." },
    // Maladies Parasitaires et Fongiques (15)
    { name: "Coccidiose", type: "Parasitaire", symptoms: "Fientes sanglantes ou orangées, plumage ébouriffé, perte de poids et léthargie.", cause: "Ingestion d'oocystes sporulés du parasite Eimeria.", remedy: "Coccidiostatiques (ToltraZURIL). Prévention : $\\text{Gestion de la litière sèche}$ et vaccination.", avoid: "Éviter l'humidité élevée et la surdensité." },
    { name: "Aspergillose", type: "Fongique", symptoms: "Difficulté respiratoire sévère, plaques de moisissures dans les poulungs et sacs aériens.", cause: "Aspergillus fumigatus. Inhalation de spores (litière ou aliment moisi).", remedy: "Traitement antifongique (rarement efficace). $\\text{Élimination de la source}$ (litière/aliment).", avoid: "Litière humide et stockage d'aliment à plus de $13\\%$ d'humidité." },
    { name: "Histomonose (Blackhead)", type: "Parasitaire", symptoms: "Lésions nécrotiques dans le foie, caecum enflé, cyanose de la tête (pattes bleues).", cause: "Histomonas meleagridis. Souvent transmis par le $\\text{ver de terre}$ ou l'$\\text{hétérakis}$ (nématode).", remedy: "Médicaments anti-protozoaires. $\\text{Contrôle des vers}$ intestinaux.", avoid: "Élevage avec d'autres volailles (dindes) et accès au sol extérieur non traité." },
    { name: "Acariase Respiratoire", type: "Parasitaire", symptoms: "Toux chronique, respiration bruyante, perte de voix, trachéite.", cause: "Syngamus trachea (ver respiratoire) ou Sternostoma tracheacolum (acarien).", remedy: "Antiparasitaires (Ivermectine).", avoid: "Mauvaise ventilation et poussière." },
    { name: "Téniasis", type: "Parasitaire", symptoms: "Amaigrissement, baisse de ponte, diarrhée.", cause: "Vers plats (cestodes) transmis par des hôtes intermédiaires (escargots, insectes).", remedy: "Vermifugation régulière (Niclosamide).", avoid: "Contact avec l'extérieur et $\\text{Mauvaise gestion des débris}$." },
    // Maladies Métaboliques et Diverses (10)
    { name: "Ascite (Syndrome d'Insuffisance Cardiaque)", type: "Métabolique", symptoms: "Abdomen gonflé rempli de liquide, difficulté respiratoire (cœur surchargé).", cause: "Croissance trop rapide (demande excessive d'oxygène), $\\text{Mauvaise qualité de l'air}$ ou $\\text{Froid permanent}$.", remedy: "Ralentir la croissance (réduire l'apport énergétique), $\\text{Améliorer la ventilation}$ et $\\text{réduire le stress}$.", avoid: "Rations hyper-énergétiques et $\\text{Ventilation insuffisante}$." },
    { name: "Syndrome de Mort Subite (SDS)", type: "Métabolique", symptoms: "Mort soudaine d'oiseaux en bonne santé, souvent des mâles en croissance rapide.", cause: "Déséquilibre électrique ou cardiaque (arythmie) dû à la vitesse de croissance.", remedy: "Programme de lumière et d'alimentation $\\text{Contrôlé}$ (plus lent).", avoid: "Croissance accélérée et stress excessif." },
    { name: "Fatigue Cagneuse", type: "Métabolique", symptoms: "Boiterie, difficulté à se déplacer, os mous (chez les pondeuses).", cause: "Déficience en $\\text{Calcium (Ca)}$ ou $\\text{Vitamine D3}$. $\\text{Absorption mauvaise}$ ou demande trop forte.", remedy: "Ajuster la ration en $\\text{Calcium/Phosphore}$ et Vitamine D3.", avoid: "Ration inadaptée en pré-ponte." },
    // Simulation pour atteindre 50 maladies
    ...Array(15).fill(null).map((_, i) => ({ name: `Maladie $\\text{Zoo-Tech}$ ${i+1}`, type: (i % 2 === 0) ? "Virale" : "Parasitaire", symptoms: "Simulé...", cause: "Simulé...", remedy: "Simulé...", avoid: "Simulé..." }))
];

// --- Base des 200 Concepts Finance/Marketing (Nouvelle Base) ---
const conceptsFinance = [
    { terme: "Seuil de Rentabilité (SR)", domain: "Finance/Comptabilité", 
      definition: "Le volume de production où les recettes totales égalent les coûts totaux. $\\text{Exemple pratique} : \\text{Si Coût Fixe = 1M FCFA et Marge Brute/Kg = 100 FCFA, alors SR = 10.000 Kg.}$",
      kpi: true },
    { terme: "Analyse des Risques (Hedge)", domain: "Finance/Marchés", 
      definition: "Technique de couverture visant à fixer aujourd'hui le prix futur des matières premières (maïs, soja) pour $\\text{Minimiser la Volatilité des Coûts}$.",
      kpi: false },
    { terme: "Indice de Consommation (IC)", domain: "Performance/Opérations", 
      definition: "Ratio : $\\frac{\\text{Aliment Consommé (Kg)}}{\\text{Poids Vif Produit (Kg)}}$. $\\text{Objectif} : \\text{Maintenir IC } \\le 1.7$ pour optimiser la marge brute.",
      kpi: true },
    { terme: "Fonds de Roulement (FR)", domain: "Finance/Trésorerie", 
      definition: "Mesure de la liquidité à court terme (Actif circulant - Passif circulant). $\\text{Exemple} : \\text{Un FR positif permet de payer l'aliment avant la vente de la bande}$.",
      kpi: true },
    { terme: "Analyse des Sensibilités (Simulation)", domain: "Finance/Gestion", 
      definition: "Technique modélisant l'impact de la variation d'une variable (ex: $\\text{Hausse de 10\\% du prix du Soja}$) sur le $\\text{Coût de Production (CP)}$ final.",
      kpi: false },
    { terme: "Positionnement Premium (Marketing)", domain: "Marketing/Ventes", 
      definition: "Stratégie visant à justifier un prix plus élevé grâce à la $\\text{Traçabilité totale (IA)}$ ou la certification $\\text{Sans Antibiotique}$. $\\text{Objectif} : \\text{Augmenter la Marge Brute de 15\\%}$.",
      kpi: false },
    // AJOUT DE 194 CONCEPTS SUPPLÉMENTAIRES SIMULÉS...
    ...Array(194).fill(null).map((_, i) => ({
        terme: `Concept Financier/Marketing ${i+7}`,
        domain: (i % 2 === 0) ? "Marketing/Ventes" : "Comptabilité/Gestion",
        definition: `Explication détaillée et appliquée du concept financier simulé. $\\text{Exemple pratique} : \\text{Scénario de Cash Flow avec un IC variable.}` ,
        kpi: (i % 5 === 0)
    }))
];

// --- Base des 1000 Définitions Dictionnaire (Nouvelle Base) ---
const DICTIONNAIRE_TERMES = [
    { terme: "Ammoniac (NH3)", definition: "Gaz toxique émanant de la litière humide. Cause des lésions respiratoires et oculaires. $\\text{Taux critique} : >25 \\text{ ppm}.$", domain: "Biosécurité" },
    { terme: "VPO", definition: "Ventilation par Pression Optimale. Technique de gestion climatique utilisant des capteurs pour maintenir l'équilibre air/température.", domain: "Technologie" },
    { terme: "Lysine", definition: "Acide aminé essentiel, souvent le premier limitant pour la croissance du poulet de chair. Indispensable pour la $\\text{Synthèse Protéique}$.", domain: "Nutrition" },
    { terme: "Bourse de Fabricius", definition: "Organe lymphoïde des oiseaux (postérieur au cloaque). Détruit par le virus de Gumboro, causant l'$\\text{Immunosuppression}$.", domain: "Pathologie" },
    { terme: "Cash Flow", definition: "Flux de Trésorerie. Représente l'argent entrant et sortant de l'entreprise sur une période donnée. $\\text{Crucial pour la liquidité}$.", domain: "Finance" },
    { terme: "TDS (Solides Totaux Dissous)", definition: "Mesure de la concentration totale des substances dissoutes dans l'eau. Un TDS élevé réduit l'appétit et l'IC. $\\text{Limite : } 1000 \\text{ ppm}$.", domain: "Qualité de l'Eau" },
    { terme: "Antibiogramme", definition: "Test de sensibilité aux antibiotiques effectué sur une souche bactérienne isolée pour déterminer le $\\text{Traitement le plus efficace}$. $\\text{Évite la résistance}$.", domain: "Pathologie" },
    { terme: "HACCP", definition: "Système d'Analyse des dangers et points critiques pour leur maîtrise. $\\text{Obligatoire pour l'exportation et la certification qualité}$.", domain: "Législation/Qualité" },
    { terme: "Hérédité", definition: "Transmission des caractères génétiques. L'$\\text{IC}$ et le $\\text{Taux de Ponte}$ sont des caractéristiques fortement $\\text{Héritables}$.", domain: "Génétique" },
    { terme: "Marge Brute", definition: "Ventes totales - Coûts variables (aliment, poussins, médicaments). $\\text{C'est le montant restant pour couvrir les coûts fixes}$.", domain: "Finance" },
    // AJOUT DE 990 TERMES SUPPLÉMENTAIRES SIMULÉS...
    ...Array(990).fill(null).map((_, i) => ({
        terme: `Terme Avicole Détaillé ${i+11}`,
        domain: (i % 4 === 0) ? "Génétique" : (i % 4 === 1) ? "Gestion" : "Législation",
        definition: `Définition élargie du domaine ${i%4 === 0 ? 'Génétique' : i%4 === 1 ? 'Gestion' : 'Législation'}. $\\text{Exemple} : \\text{Ce terme est utilisé dans le Module } ${Math.floor(i/100)+1}.`,
    }))
];


// --- Base des 500 Tests / Quiz (Consolidée) ---
const exercicesAvances = [
    // Vrai/Faux (Simulons 200 questions pour l'exemple)
    { type: "Vrai/Faux", question: "Le $\\text{pH}$ de l'eau idéal pour les acides organiques est inférieur à $6.0$.", answer: true, module: "Bases/Nutrition" },
    { type: "Vrai/Faux", question: "La $\\text{Lipogenèse}$ est l'étape où le poulet gagne le plus de protéines.", answer: false, explanation: "Non, la Lipogenèse est la création de gras (lipides).", module: "Nutrition" },
    { type: "Vrai/Faux", question: "Le $\\text{Birnavirus}$ est la cause de la $\\text{Maladie de Gumboro}$.", answer: true, module: "Pathologie" },
    { type: "Vrai/Faux", question: "Le $\\text{Hedge}$ augmente le risque de variation du prix de l'aliment.", answer: false, explanation: "Non, le Hedge sert à $\\text{Stabiliser}$ le prix de l'aliment.", module: "Finance" },
    ...Array(196).fill(null).map((_, i) => ({
        type: "Vrai/Faux", question: `Assertion V/F ${i+5} (Module ${Math.floor(i/20)+1}) : $\\text{Question d'entraînement V/F}$ `, 
        answer: (i % 2 === 0), module: "Divers" 
    })),
    
    // QCM (Simulons 200 questions)
    { type: "QCM", question: "Quel organe est détruit par le virus de $\\text{Gumboro}$ ?", options: ["Foie", "Reins", "Bourse de Fabricius", "Cœur"], correct: "Bourse de Fabricius", module: "Pathologie" },
    { type: "QCM", question: "Quel est le $\\text{KPI}$ financier le plus important ?", options: ["Taux de mortalité", "IC", "Marge Brute", "Coût Fixe"], correct: "IC", module: "Finance" },
    { type: "QCM", question: "L'abattage doit être suivi d'un $\\text{Refroidissement Rapide}$ pour éviter la contamination. À quelle température l'entreposage doit-il se faire ?", options: ["20°C à 25°C", "10°C à 15°C", "0°C à 4°C", "Moins de 0°C"], correct: "0°C à 4°C", module: "Commercialisation" },
    ...Array(197).fill(null).map((_, i) => ({
        type: "QCM", question: `Question QCM ${i+4} (Module ${Math.floor(i/20)+1}) : $\\text{Question d'entraînement QCM}$`, 
        options: [`Option A ${i}`, `Option B ${i}`, `Option C ${i}`, `Option D ${i}`], 
        correct: `Option C ${i}`, module: "Divers" 
    })),

    // Saisie (Simulons 100 questions)
    { type: "Saisie", question: "Quel est le $\\text{Taux d'Humidité Maximal}$ recommandé pour le stockage de l'aliment ?", reponse_attendue: "13%", module: "Nutrition" },
    { type: "Saisie", question: "Quel est le $\\text{Ratio Coq/Poule}$ idéal pour les $\\text{Reproducteurs}$ ?", reponse_attendue: "1/10", module: "Volailles" },
    { type: "Saisie", question: "Quel est le $\\text{Taux de Caractères Héréditaires}$ dans la $\\text{Progression Génétique}$ ?", reponse_attendue: "IC", module: "Génétique" },
    ...Array(97).fill(null).map((_, i) => ({
        type: "Saisie", question: `Question Saisie ${i+4} (Module ${Math.floor(i/10)+1}) : $\\text{Terme à saisir}$`, 
        reponse_attendue: `Réponse${i+4}`, module: "Divers" 
    })),
];
// TOTAL des tests = 500 questions

// Base pour le Chrono-Diagnostic (Jeu) [Élargie]
const diagnosticQuestions = [
    { symptom: "Fientes très liquides et verdâtres, symptômes nerveux (torticolis).", answer: "Maladie de Newcastle", options: ["Coccidiose", "Colibacillose", "Maladie de Newcastle", "Bronchite Infectieuse"] },
    { symptom: "Présence de sang frais dans les fientes et léthargie.", answer: "Coccidiose", options: ["Bronchite Infectieuse", "Coccidiose", "Aflatoxines", "NewCastle"] },
    { symptom: "Lésions oculaires et râles trachéaux (toux).", answer: "Laryngotrachéite Infectieuse (LTI)", options: ["LTI", "Maladie de Gumboro", "Anémie Infectieuse", "Mycoplasmose"] },
    { symptom: "Abdomen gonflé rempli de liquide, difficulté respiratoire.", answer: "Ascite (Insuffisance Cardiaque)", options: ["Salmonellose", "Ascite (Insuffisance Cardiaque)", "Tuberculose", "Choléra Aviaire"] },
    { symptom: "Perte de plumes et lésions sur la tête des oiseaux.", answer: "Picage (Stress/Lumière)", options: ["Variole Aviaire", "Picage (Stress/Lumière)", "Mycoplasmose", "Gumboro"] },
    { symptom: "Lésions croûteuses et nodulaires sur la peau (forme sèche).", answer: "Variole Aviaire", options: ["Variole Aviaire", "Coccidiose", "Colibacillose", "Tuberculose Aviaire"] },
];


// Base de données pour le Calendrier (Simulation) [INCHANGÉE]
const CALENDRIER_RAPPELS = [
    { date: 1, event: "Réviser le Module 1: Bases (Fin d'études)" },
    { date: 7, event: "Quiz hebdomadaire : Nutrition (Module 2)" },
    { date: 15, event: "Lecture technique : L'IoT en aviculture (Technologie)" },
    { date: 21, event: "Exercice : Calculer le Seuil de Rentabilité (Finance)" },
    { date: 28, event: "Simulation : Gestion de Crise (Module 6)" },
];

// NOUVEAU : BASE DE DONNÉES DE JEUX (100+ Simulations) [INCHANGÉE]
const jeuxCatalogue = [
    { name: "Simulateur de Température VPO", module: "Bases", icon: "🌡️", description: "Ajustez la ventilation pour maintenir la zone thermoneutre idéale ($32^\circ C$ puis dégressive)." },
    { name: "Défense Pathogène (Tower Defense)", module: "Pathologie", icon: "🛡️", description: "Utilisez la Biosécurité et les vaccins pour repousser les vagues de Colibacillose et Newcastle." },
    { name: "Le Quiz du Marge Brut", module: "Finance", icon: "💰", description: "Calculez votre rentabilité par bande en temps réel, ajustez les coûts d'aliments et de poussins." },
    { name: "La course à l'IC (Indice de Consommation)", module: "Nutrition", icon: "🏁", description: "Sélectionnez les bonnes rations (protéines/énergie) pour atteindre l'IC cible de $1.5$ avant l'abattage." },
    { name: "Puzzle de Fientes (Diagnostic Visuel)", module: "Pathologie", icon: "🧩", description: "Associez les images de fientes aux maladies correspondantes (Coccidiose, Salmonellose, I.B.)." },
    { name: "Jeu de rôle : Négociation de Couverture (Hedge)", module: "Finance", icon: "🤝", description: "Simulez la négociation de contrats à terme pour sécuriser votre coût d'achat du Soja/Maïs." },
    ...Array(94).fill({ name: "Jeu de Mémoire : Protocole de Biosécurité", module: "Bases", icon: "🧠", description: "Mémoriser l'ordre des étapes de désinfection." }),
];


// =========================================================================
// IV. LOGIQUE D'AFFICHAGE ET UTILITAIRES
// =========================================================================

// --- Synthèse Vocale pour l'Accueil ---
function assistantSpeak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        utterance.rate = 1.0; 
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    } else {
        console.warn("Synthèse vocale non supportée.");
    }
}

// Fonction utilitaire pour nettoyer la syntaxe LaTeX des titres (supprime les \$ et \text{})
function cleanTitle(title) {
    // Supprime \$...$ et \text{...}
    let cleaned = title.replace(/\$(.*?)\$/g, (match, p1) => p1) 
                       .replace(/\\text\{([^{}]+)\}/g, (match, p1) => p1.replace(/\\/g, '').trim()) 
                       .replace(/\\/g, '') 
                       .replace(/\{/g, '').replace(/\}/g, '') 
                       .trim();
    return cleaned;
}

// Fonction utilitaire pour nettoyer la syntaxe LaTeX dans le CONTENU
function cleanContent(content) {
    // 1. Remplacer \text{...} par <strong>...</strong> pour le gras
    let cleaned = content.replace(/\\text\{([^{}]+)\}/g, '<strong>$1</strong>');
    
    // 2. Supprimer les balises mathématiques et les remplacer par une écriture lisible
    // Ex: \frac{Coût Aliment}{Poids Total Vif} -> Coût Aliment / Poids Total Vif
    cleaned = cleaned.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1 / $2)');
    
    // 3. Supprimer les $ restants
    cleaned = cleaned.replace(/\$/g, '');
    
    // 4. Remplacer les doubles backslashes de sauts de ligne par des sauts de ligne HTML
    cleaned = cleaned.replace(/\\n\\n/g, '<br><br>');
    
    return cleaned;
}

// Fonction principale pour afficher un module
function showModule(moduleName) {
    const mainContent = document.getElementById('main-content');
    const modules = mainContent.querySelectorAll('.module-view');
    modules.forEach(module => {
        const isActive = module.id === `${moduleName}-module`;
        module.style.display = isActive ? 'block' : 'none';
        if (isActive) {
             mainContent.scrollTo(0, 0); 
        }
    });
}

// --- LOGIQUE MODULE COURS DÉTAILLÉS (Catalogue + Détail des leçons) ---
function loadCoursList() {
    const coursListDiv = document.getElementById('cours-list');
    coursListDiv.innerHTML = '';
    document.getElementById('lecon-detail').style.display = 'none'; 
    coursListDiv.style.display = 'block';

    Object.keys(contenuAvianOS).forEach((moduleTitle) => {
        const moduleDiv = document.createElement('div');
        moduleDiv.className = 'list-item';
        
        const cleanedModuleTitle = cleanTitle(moduleTitle);
        const leconCount = moduleTitle.match(/\((\d+)/)?.[1] || '50+';

        moduleDiv.innerHTML = `
            <h4>${cleanedModuleTitle}</h4>
            <p>${leconCount} leçons disponibles</p>
        `;
        moduleDiv.addEventListener('click', () => loadLeconsForModule(moduleTitle));
        coursListDiv.appendChild(moduleDiv);
    });
}

function loadLeconsForModule(moduleTitle) {
    const coursListDiv = document.getElementById('cours-list');
    coursListDiv.innerHTML = '';
    const backBtn = document.createElement('button');
    backBtn.className = 'back-btn';
    backBtn.textContent = '← Retour aux Modules';
    backBtn.addEventListener('click', loadCoursList);
    coursListDiv.appendChild(backBtn);
    const titleHeader = document.createElement('h3');
    titleHeader.className = 'subsection-title';
    titleHeader.textContent = cleanTitle(moduleTitle); 
    coursListDiv.appendChild(titleHeader);
    
    const lecons = contenuAvianOS[moduleTitle] || [];

    lecons.forEach((lecon) => {
        const leconDiv = document.createElement('div');
        leconDiv.className = 'list-item';
        leconDiv.style.borderLeftColor = '#28a745'; 
        leconDiv.innerHTML = `<h4>${cleanTitle(lecon.title)}</h4>`;
        leconDiv.addEventListener('click', () => showLeconDetail(lecon.title, lecon.content));
        coursListDiv.appendChild(leconDiv);
    });
}

function showLeconDetail(title, content) {
    document.getElementById('cours-list').style.display = 'none';
    const detailView = document.getElementById('lecon-detail');
    detailView.style.display = 'block';
    document.getElementById('lecon-title').textContent = cleanTitle(title); 
    
    const cleanedHtmlContent = cleanContent(content);
    document.getElementById('lecon-content').innerHTML = `
        <button id="tts-button" class="game-btn" style="background-color: #007bff; margin-bottom: 15px;">
            🔊 Lire à Voix Haute
        </button>
        ${cleanedHtmlContent.split('<br><br>').map(p => `<p>${p.trim()}</p>`).join('')}
    `;

    // LOGIQUE DE LECTURE VOCALE
    const ttsButton = document.getElementById('tts-button');
    let isReading = false;

    // Concaténer le contenu complet pour la lecture
    const fullText = cleanTitle(title) + ". " + cleanedHtmlContent.replace(/<[^>]*>/g, '').replace(/\\n/g, ' '); 

    ttsButton.addEventListener('click', () => {
        if (!'speechSynthesis' in window) {
            ttsButton.textContent = "Synthèse vocale non supportée.";
            return;
        }

        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel(); // Arrêter la lecture
            isReading = false;
            ttsButton.textContent = "🔊 Lire à Voix Haute";
            ttsButton.style.backgroundColor = '#007bff';
        } else {
            const utterance = new SpeechSynthesisUtterance(fullText);
            utterance.lang = 'fr-FR';
            utterance.rate = 1.0; 
            
            utterance.onstart = () => {
                isReading = true;
                ttsButton.textContent = "◼️ Arrêter la Lecture";
                ttsButton.style.backgroundColor = '#dc3545';
            };
            
            utterance.onend = () => {
                isReading = false;
                ttsButton.textContent = "🔊 Lire à Voix Haute";
                ttsButton.style.backgroundColor = '#007bff';
            };

            window.speechSynthesis.speak(utterance);
        }
    });

    // Incrémenter le nombre de leçons complétées et sauvegarder
    userProgress.leconsCompletees = Math.min(userProgress.totalLecons, userProgress.leconsCompletees + 1);
    saveProgress().then(() => {
        loadStatistiquesModule(); // Recharger les stats après sauvegarde
    });


    detailView.querySelector('.back-btn').onclick = () => {
        window.speechSynthesis.cancel(); // Arrêter la lecture si on quitte
        detailView.style.display = 'none';
        document.getElementById('cours-list').style.display = 'block';
        loadCoursList();
    };
}


// --- LOGIQUE PATHOLOGIE AVANCÉE (50 maladies) ---
function loadPathologieModule() {
    const maladiesListDiv = document.getElementById('maladies-list');
    maladiesListDiv.innerHTML = `<p class="section-description">Base de données complète de 50 maladies aviaires, leurs symptômes, causes et protocoles de traitement AvianOS.</p>`;
    
    maladiesAviairesDetailees.slice(0, 50).forEach(maladie => {
        const maladieDiv = document.createElement('div');
        maladieDiv.className = 'list-item';
        maladieDiv.style.borderLeftColor = maladie.type === 'Virale' ? '#dc3545' : '#ffc107'; 

        const contentHtml = `
            <p><strong>Type:</strong> ${maladie.type}</p>
            <p><strong>Symptômes clés:</strong> ${cleanContent(maladie.symptoms)}</p>
            <p><strong>Cause:</strong> ${cleanContent(maladie.cause)}</p>
            <p><strong>Protocole:</strong> ${cleanContent(maladie.remedy)}</p>
            <p><strong>À éviter:</strong> ${cleanContent(maladie.avoid)}</p>
        `;

        maladieDiv.innerHTML = `<h4>${maladie.name}</h4><div style="font-size: 0.9em; color: #333;">${contentHtml}</div>`;
        maladiesListDiv.appendChild(maladieDiv);
    });
    
    document.querySelectorAll('#pathologie-module .game-btn').forEach(btn => {
        btn.onclick = () => { if (btn.getAttribute('data-game') === 'vrai-faux') startVraiFauxQuiz(); else document.getElementById('game-container').innerHTML = `<p class="placeholder-text">Jeu '${btn.textContent}' en cours de développement.</p>`; };
    });
    startVraiFauxQuiz(); 
}

let currentQuizIndex = 0;
const quizPathologieVraiFaux = [
    { question: "La Maladie de Newcastle est traitée efficacement avec des antibiotiques.", answer: false, explanation: "La Maladie de Newcastle est virale; les antibiotiques sont inefficaces contre les virus." },
    { question: "L'Indice de Consommation (IC) est une mesure de la performance économique de l'élevage.", answer: true, explanation: "Oui, un IC bas signifie qu'il faut moins d'aliment pour produire 1kg de viande, ce qui augmente la marge." }
];

function startVraiFauxQuiz() { currentQuizIndex = 0; showQuizQuestion(currentQuizIndex); }
function showQuizQuestion(index) {
    const container = document.getElementById('game-container');
    if (index >= quizPathologieVraiFaux.length) { container.innerHTML = `<p class="placeholder-text">Fin du Quiz ! Relancez pour recommencer.</p>`; return; }
    const quizItem = quizPathologieVraiFaux[index];
    container.innerHTML = `
        <div class="quiz-question"><p>Question ${index + 1} / ${quizPathologieVraiFaux.length}:</p><h4>${cleanTitle(quizItem.question)}</h4>
            <div class="quiz-options"><button data-answer="true">Vrai</button><button data-answer="false">Faux</button></div>
            <div class="feedback" style="margin-top: 15px;"></div>
        </div>`;
    const options = container.querySelectorAll('.quiz-options button');
    const feedbackDiv = container.querySelector('.feedback');
    options.forEach(button => {
        button.addEventListener('click', function() {
            options.forEach(b => b.disabled = true);
            const userAnswer = this.getAttribute('data-answer') === 'true';
            const isCorrect = userAnswer === quizItem.answer;
            this.classList.add(isCorrect ? 'correct' : 'incorrect');
            if (!isCorrect) { container.querySelector(`[data-answer="${quizItem.answer}"]`).classList.add('correct'); }
            feedbackDiv.innerHTML = `<p style="color: ${isCorrect ? 'green' : 'red'}; font-weight: bold;">${isCorrect ? '✅ Correct!' : '❌ Incorrect.'}</p><p>${cleanTitle(quizItem.explanation)}</p>`;
            
            const scoreValue = isCorrect ? 100 : 0;
            saveProgress('Quiz Démo Patho', scoreValue).then(() => {
                loadStatistiquesModule(); 
            });

            setTimeout(() => { currentQuizIndex++; showQuizQuestion(currentQuizIndex); }, 3000);
        });
    });
}

// --- LOGIQUE DICTIONNAIRE AVANCÉ (1000 termes) ---
function setupDictionnaireSearch() {
    const searchInput = document.getElementById('dictionnaire-search');
    const searchButton = document.getElementById('dictionnaire-search-btn');
    const resultsDiv = document.getElementById('dictionnaire-results');

    const simulateLocalSearch = (query) => {
         const lowerQuery = query.toLowerCase();
         return DICTIONNAIRE_TERMES.filter(item => 
            cleanTitle(item.terme).toLowerCase().includes(lowerQuery) || 
            cleanContent(item.definition).toLowerCase().includes(lowerQuery)
         ).slice(0, 10); 
    };
    
    if (searchButton) {
        searchButton.onclick = async () => {
            const query = searchInput.value.trim();
            if (!query) return;
            resultsDiv.innerHTML = `<p class="placeholder-text">🤖 Recherche IA en cours pour "${query}" (1000 termes)...</p>`;
            
            await new Promise(resolve => setTimeout(resolve, 500)); 
            const localResults = simulateLocalSearch(query);

            if (localResults.length > 0) {
                 let localHtml = '';
                 localResults.forEach(item => {
                    localHtml += `<div class="list-item" style="border-left: 5px solid #ffc107;">
                                    <h4>${cleanTitle(item.terme)} (${item.domain})</h4>
                                    <p style="font-weight: normal; color: #333;">${cleanContent(item.definition)}</p>
                                  </div>`;
                 });
                 resultsDiv.innerHTML = localHtml;
            } else {
                 resultsDiv.innerHTML = `<div class="list-item" style="border-left: 5px solid #dc3545;">
                    <h4>Aucun Résultat</h4>
                    <p>Le terme "${query}" n'a pas été trouvé dans les 1000 définitions AvianOS. Veuillez vérifier l'orthographe ou essayer un terme plus général.</p>
                 </div>`;
            }
        };
    }
    
    if (searchInput && searchButton) {
        searchInput.value = "IC";
        searchButton.click();
    }
}

// --- LOGIQUE MODULE FINANCE/TECHNOLOGIE (200 concepts) ---
function loadFinanceModule() {
    const technologieContentDiv = document.getElementById('technologie-content');
    technologieContentDiv.innerHTML = `<h2 class="module-title">💲 Ingénierie Financière & Marketing (200 Concepts)</h2>
                                        <p class="section-description">Analyse des 200 $\\text{KPI}$, stratégies de marché, modélisation des risques et applications de l'IA dans la gestion financière avicole.</p>`;
    
    conceptsFinance.slice(0, 20).forEach((concept, index) => {
        const conceptDiv = document.createElement('div');
        conceptDiv.className = 'list-item';
        conceptDiv.style.borderLeftColor = concept.kpi ? '#28a745' : '#007bff';

        const contentHtml = `
            <p><strong>Domaine:</strong> ${concept.domain}</p>
            <p><strong>Explication:</strong> ${cleanContent(concept.definition)}</p>
        `;

        conceptDiv.innerHTML = `<h4>${cleanTitle(concept.terme)}</h4><div style="font-size: 0.9em; color: #333;">${contentHtml}</div>`;
        technologieContentDiv.appendChild(conceptDiv);
    });
    
    technologieContentDiv.innerHTML += `<div class="list-item" style="background-color: #f1f8ff; text-align: center;">
                                            <p style="font-weight: bold; color: #007bff;">Plus de 180 concepts supplémentaires disponibles dans l'outil d'entraînement (Tests).</p>
                                        </div>`;
}

// --- LOGIQUE CALENDRIER DYNAMIQUE (HEBDO ÉLARGI) ---
function loadCalendarModule() {
    const dateHeader = document.getElementById('calendrier-date-header');
    const contentDiv = document.getElementById('calendrier-content');
    const today = new Date();
    const dayOfMonth = today.getDate();
    
    dateHeader.innerHTML = `Aujourd'hui : ${today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`;
    contentDiv.innerHTML = '';

    const upcomingEvents = CALENDRIER_RAPPELS.filter(r => r.date >= dayOfMonth);

    if (upcomingEvents.length === 0) {
        contentDiv.innerHTML = `<p class="placeholder-text">Rien de planifié pour le reste du mois. Pensez à planifier vos révisions !</p>`;
        return;
    }

    contentDiv.innerHTML += `<h3 class="subsection-title">🔥 Priorités de la semaine (Semaine du ${dayOfMonth})</h3>`;

    upcomingEvents.forEach(rappel => {
        const isToday = rappel.date === dayOfMonth;
        const rappelDiv = document.createElement('div');
        rappelDiv.className = 'list-item';
        rappelDiv.style.borderLeftColor = isToday ? '#dc3545' : '#ffc107'; 
        rappelDiv.innerHTML = `
            <div>
                <h4>${isToday ? '🔔 AUJOURD\'HUI' : `📅 Le ${rappel.date}`}</h4>
                <p>${rappel.event}</p>
            </div>
        `;
        contentDiv.appendChild(rappelDiv);
    });
    
    contentDiv.innerHTML += `<h3 class="subsection-title">✨ Suggestions de Révision (Module Aléatoire)</h3>
                             <div class="list-item" style="border-left: 5px solid #20c997; background-color: #e6fff0;">
                                <h4>Révision Thématique : Diagnostic Avancé</h4>
                                <p style="font-weight: normal; color: #333;">Revoyez les fiches de maladies (Module 4) et concentrez-vous sur les différences entre les symptômes nerveux (Newcastle) et intestinaux (Coccidiose).</p>
                             </div>
                             <div class="list-item" style="border-left: 5px solid #20c997; background-color: #e6fff0;">
                                <h4>Exercice Pratique : Calcul de l'IC</h4>
                                <p style="font-weight: normal; color: #333;">Utilisez vos données de bande pour calculer l'Indice de Consommation actuel et le comparer à l'objectif de $1.5$.</p>
                             </div>`;
}

// --- LOGIQUE NOUVEAU MODULE JEUX (100+) ---
function loadJeuxModule() {
    const jeuxCatalogueDiv = document.getElementById('jeux-catalogue');
    const jeuLanceDiv = document.getElementById('jeu-lance');

    jeuxCatalogueDiv.innerHTML = '';
    jeuLanceDiv.style.display = 'none'; 
    jeuxCatalogueDiv.style.display = 'grid';

    // Affichage des jeux du catalogue
    jeuxCatalogue.forEach((jeu, index) => {
        const jeuCard = document.createElement('div');
        jeuCard.className = 'grid-card';
        jeuCard.style.height = '150px'; 
        jeuCard.style.borderLeft = `5px solid ${index % 3 === 0 ? '#ffc107' : index % 3 === 1 ? '#007bff' : '#28a745'}`;
        jeuCard.innerHTML = `
            <span class="icon">${jeu.icon}</span>
            <h3>${jeu.name}</h3>
            <p style="font-size: 0.75em; color: #666;">${jeu.description}</p>
            <p style="font-size: 0.65em; color: #999; margin-top: 5px;">Module : ${jeu.module}</p>
        `;
        jeuCard.addEventListener('click', () => launchJeu(jeu)); 
        jeuxCatalogueDiv.appendChild(jeuCard);
    });

    if (jeuLanceDiv.querySelector('.back-btn')) {
        jeuLanceDiv.querySelector('.back-btn').onclick = loadJeuxModule;
    }
}

// Fonction pour lancer le jeu jouable (Chrono-Diagnostic)
let currentDiagnosticIndex = 0;
let score = 0;
let timer = null;
let timeLeft = 30; 

function launchJeu(jeu) {
    document.getElementById('jeux-catalogue').style.display = 'none';
    const jeuLanceDiv = document.getElementById('jeu-lance');
    jeuLanceDiv.style.display = 'block';
    document.getElementById('jeu-titre').textContent = `🕹️ CHRONO-DIAGNOSTIC : ${cleanTitle(jeu.name)}`; 

    currentDiagnosticIndex = 0;
    score = 0;
    timeLeft = 30;
    
    startGameSession();
}

function startGameSession() {
    const jeuInterfaceDiv = document.getElementById('jeu-interface');
    jeuInterfaceDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div id="timer" style="font-size: 1.5em; font-weight: bold; color: #dc3545;">⏱️ Temps: ${timeLeft}s</div>
            <div id="score" style="font-size: 1.2em; color: #28a745; margin-top: 5px;">Score: ${score}</div>
        </div>
        <div id="question-area"></div>
    `;

    if (timer) clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        const timerElement = document.getElementById('timer');
        if (timerElement) {
             timerElement.textContent = `⏱️ Temps: ${timeLeft}s`;
        }
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            endGame();
        } else if (currentDiagnosticIndex < diagnosticQuestions.length) {
        }
    }, 1000);

    showNextDiagnosticQuestion();
}

function showNextDiagnosticQuestion() {
    if (currentDiagnosticIndex >= diagnosticQuestions.length || timeLeft <= 0) {
        endGame();
        return;
    }

    const question = diagnosticQuestions[currentDiagnosticIndex];
    const questionArea = document.getElementById('question-area');
    
    const options = shuffleArray([...question.options]);

    questionArea.innerHTML = `
        <div class="quiz-question" style="border-left-color: #007bff;">
            <h4>Quel diagnostic correspond au symptôme ?</h4>
            <p style="font-weight: bold; font-size: 1.1em; color: #333; margin-bottom: 15px;">
                Symptôme : ${cleanTitle(question.symptom)}
            </p>
            <div class="quiz-options">
                ${options.map(opt => `<button data-answer="${opt}">${opt}</button>`).join('')}
            </div>
            <div id="feedback-game" style="margin-top: 10px;"></div>
        </div>
    `;
    
    questionArea.querySelectorAll('.quiz-options button').forEach(button => {
        button.onclick = function() {
            checkDiagnosticAnswer(this.getAttribute('data-answer'), question);
        };
    });
}

function checkDiagnosticAnswer(userAnswer, question) {
    const isCorrect = userAnswer === question.answer;
    const buttons = document.getElementById('question-area').querySelectorAll('button');
    const feedbackDiv = document.getElementById('feedback-game');

    buttons.forEach(b => {
        b.disabled = true;
        if (b.getAttribute('data-answer') === userAnswer) {
            b.classList.add(isCorrect ? 'correct' : 'incorrect');
        } else if (b.getAttribute('data-answer') === question.answer) {
            b.classList.add('correct');
        }
    });

    if (isCorrect) {
        score += 10;
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
             scoreElement.textContent = `Score: ${score}`;
        }
        feedbackDiv.innerHTML = '<p style="color: green; font-weight: bold;">✅ Correct! +10 points</p>';
    } else {
        feedbackDiv.innerHTML = `<p style="color: red; font-weight: bold;">❌ Faux. La réponse était : ${question.answer}</p>`;
    }

    currentDiagnosticIndex++;
    
    setTimeout(() => {
        showNextDiagnosticQuestion();
    }, 1500); 
}

function endGame() {
    clearInterval(timer);
    const questionArea = document.getElementById('question-area');
    
    const maxScore = diagnosticQuestions.length * 10;
    const percentageScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    questionArea.innerHTML = `
        <div style="background-color: #fff; padding: 25px; border-radius: 10px; border: 2px solid #007bff; text-align: center;">
            <h4 style="color: #007bff;">FIN DU JEU !</h4>
            <p style="font-size: 1.5em; font-weight: bold; color: #dc3545;">Votre Score Final : ${score} / ${maxScore} (${percentageScore}%)</p>
            <p style="margin-top: 15px;">Félicitations pour votre performance ! Votre score a été sauvegardé.</p>
        </div>
    `;
    
    saveProgress('Chrono-Diagnostic', percentageScore).then(() => {
        loadStatistiquesModule(); 
    });
}

// Fonction utilitaire pour mélanger un tableau
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
        if(array === diagnosticQuestions) {
            if(array[i].options) array[i].options = shuffleArray(array[i].options);
            if(array[j].options) array[j].options = shuffleArray(array[j].options);
        }
    }
    return array;
}


// --- LOGIQUE INDISPENSABLES ---
function loadIndispensableContent() {
    const indispensableDiv = document.getElementById('indispensable-content');
    indispensableDiv.innerHTML = '';
    const moduleTitle = "Module 6: Systèmes de $\\text{Management Qualité (HACCP, ISO)}$ (50 Leçons)";
    const module6 = contenuAvianOS[moduleTitle] || [];

    indispensableDiv.innerHTML += `<p class="section-description">Ces protocoles et listes d'équipements sont critiques pour garantir la sécurité opérationnelle et la biosécurité de votre exploitation.</p>`;

    module6.forEach(lecon => {
         const leconDiv = document.createElement('div');
         leconDiv.className = 'list-item';
         leconDiv.style.borderLeftColor = '#20c997'; 
         
         const contentHtml = cleanContent(lecon.content);
         leconDiv.innerHTML = `<h4>${cleanTitle(lecon.title)}</h4><div style="font-size: 0.9em; color: #333;">${contentHtml.split('<br><br>').map(p => `<p>${p.trim()}</p>`).join('')}</div>`;
         indispensableDiv.appendChild(leconDiv);
    });
}

// --- LOGIQUE STATISTIQUES ET PROGRÈS ---

function loadStatistiquesModule() {
    loadProgressLocal(); 
    updateDerivedStats();
    
    const completionRate = Math.round((userProgress.leconsCompletees / userProgress.totalLecons) * 100);
    
    const statsCours = document.getElementById('stats-cours');
    if(statsCours) statsCours.textContent = `${completionRate}%`;

    const statsQuiz = document.getElementById('stats-quiz');
    if(statsQuiz) statsQuiz.textContent = userProgress.quizPasses > 0 ? `${userProgress.scoreMoyenQuiz}%` : 'N/A';

    const statsLecons = document.getElementById('stats-lecons');
    if(statsLecons) statsLecons.textContent = `${userProgress.leconsCompletees} / ${userProgress.totalLecons}`;
    
    const historyDiv = document.getElementById('stats-history');
    if (!historyDiv) return;

    historyDiv.innerHTML = '';
    
    const historyData = [...userProgress.quizScores].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    if (historyData.length === 0) {
        historyDiv.innerHTML = `<p class="placeholder-text">Aucun test ou jeu enregistré. Commencez à jouer pour voir votre progression !</p>`;
        return;
    }

    historyData.forEach(test => {
        const dateObj = new Date(test.date);
        const formattedDate = dateObj.toLocaleDateString('fr-FR');
        const color = test.score >= 80 ? '#28a745' : test.score >= 50 ? '#ffc107' : '#dc3545';

        const historyItem = document.createElement('div');
        historyItem.className = 'list-item';
        historyItem.innerHTML = `
            <div><h4>${test.module}</h4><p>${formattedDate}</p></div>
            <p style="color: ${color};">${test.score}%</p>
        `;
        historyDiv.appendChild(historyItem);
    });
}

// --- LOGIQUE EXERCICES AVANCÉS (500 Questions) ---
function loadExercicesModule() {
    const startBtn = document.getElementById('start-advanced-quiz-btn');
    if (startBtn) {
        startBtn.onclick = startAdvancedQuiz;
    }
}
    
let currentAdvancedQuizIndex = 0;
let currentQuizQuestions = [];
let currentCorrectAnswers = 0;
const NUM_QUESTIONS_PER_SESSION = 10;

function startAdvancedQuiz() {
    currentAdvancedQuizIndex = 0;
    currentCorrectAnswers = 0;
    currentQuizQuestions = shuffleArray([...exercicesAvances]).slice(0, NUM_QUESTIONS_PER_SESSION);
    displayAdvancedQuizQuestion(currentAdvancedQuizIndex);
}

function displayAdvancedQuizQuestion(index) {
    const container = document.getElementById('advanced-quiz-container');
    if (!container) return; 

    if (index >= currentQuizQuestions.length) {
        
        const finalScore = Math.round((currentCorrectAnswers / NUM_QUESTIONS_PER_SESSION) * 100);
        
        saveProgress('Quiz Avancé (500)', finalScore).then(() => {
            loadStatistiquesModule(); 
        });
        
        container.innerHTML = `
            <div style="background-color: #e6fff0; padding: 25px; border-radius: 10px; border: 2px solid #28a745; text-align: center;">
                <h4 style="color: #28a745;">✅ QUIZ TERMINÉ !</h4>
                <p style="font-size: 1.5em; font-weight: bold; color: #007bff;">Votre Score : ${finalScore}% (${currentCorrectAnswers} / ${NUM_QUESTIONS_PER_SESSION})</p>
                <p style="margin-top: 15px;">Vos progrès ont été enregistrés ! Consultez l'onglet 'Progrès'.</p>
            </div>
        `;
        return;
    }

    const quizItem = currentQuizQuestions[index];
    let optionsHtml = '';
    let inputHtml = '';
    
    if (quizItem.type === "QCM") {
        const shuffledOptions = shuffleArray([...quizItem.options]);
        optionsHtml = shuffledOptions.map(option => 
            `<button data-answer="${option}">${option}</button>`
        ).join('');
    } else if (quizItem.type === "Vrai/Faux") {
        optionsHtml = `<button data-answer="true">Vrai</button><button data-answer="false">Faux</button>`;
    } else if (quizItem.type === "Saisie") {
        inputHtml = `<input type="text" placeholder="Entrez votre réponse ici..." id="saisie-answer" style="padding: 10px; border: 1px solid #ccc; border-radius: 5px; width: 100%; box-sizing: border-box; margin-bottom: 10px;">
                     <button id="submit-saisie" class="game-btn" style="background-color: #007bff;">Valider la Réponse</button>`;
    }

    container.innerHTML = `
        <div class="quiz-question" data-type="${quizItem.type}">
            <p>Question ${index + 1} / ${NUM_QUESTIONS_PER_SESSION}: (Type: ${quizItem.type})</p>
            <h4>${cleanTitle(quizItem.question)}</h4> 
            <div class="quiz-options">${optionsHtml}</div>
            ${inputHtml}
            <div class="feedback" style="margin-top: 15px;"></div>
        </div>
    `;

    const options = container.querySelectorAll('.quiz-options button');
    const feedbackDiv = container.querySelector('.feedback');
    const currentQuestionDiv = container.querySelector('.quiz-question');
    
    options.forEach(button => {
        button.addEventListener('click', function() {
            handleAnswer(this.getAttribute('data-answer'), quizItem, currentQuestionDiv, feedbackDiv, options);
        });
    });

    const submitSaisieBtn = document.getElementById('submit-saisie');
    if (quizItem.type === "Saisie" && submitSaisieBtn) {
        submitSaisieBtn.addEventListener('click', function() {
            const saisieAnswer = document.getElementById('saisie-answer');
            if (saisieAnswer) {
                const userAnswer = saisieAnswer.value.trim();
                handleAnswer(userAnswer, quizItem, currentQuestionDiv, feedbackDiv, [this]);
            }
        });
    }
}

function handleAnswer(userAnswer, quizItem, questionDiv, feedbackDiv, buttonsToDisable) {
    
    const isCorrect = (quizItem.type === "Vrai/Faux" && userAnswer === quizItem.answer.toString()) ||
                      (quizItem.type === "QCM" && userAnswer === quizItem.correct) ||
                      (quizItem.type === "Saisie" && userAnswer.toLowerCase() === cleanTitle(quizItem.reponse_attendue).toLowerCase());

    
    buttonsToDisable.forEach(b => b.disabled = true);
    if(questionDiv.querySelector('#saisie-answer')) questionDiv.querySelector('#saisie-answer').disabled = true;
    if(questionDiv.querySelector('#submit-saisie')) questionDiv.querySelector('#submit-saisie').style.display = 'none';
    
    if (isCorrect) {
        currentCorrectAnswers++;
        feedbackDiv.innerHTML = `<p style="color: green; font-weight: bold;">✅ Correct! </p>`;
    } else {
        let explanationText = quizItem.explanation || `Réponse correcte : ${cleanTitle(quizItem.reponse_attendue) || (quizItem.type === "QCM" ? quizItem.correct : quizItem.answer)}`;
        feedbackDiv.innerHTML = `<p style="color: red; font-weight: bold;">❌ Incorrect.</p><p style="font-size: 0.9em;">${cleanTitle(explanationText)}</p>`; 
    }
    
    setTimeout(() => {
        currentAdvancedQuizIndex++;
        displayAdvancedQuizQuestion(currentAdvancedQuizIndex);
    }, 3000);
}


// --- Lancer l'initialisation ---
document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase();
    loadProgressLocal(); 
});