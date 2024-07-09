// Attend que le DOM soit complètement chargé avant d'exécuter le code à l'intérieur
document.addEventListener('DOMContentLoaded', () => {
    // Sélectionne le formulaire
    const form = document.getElementById('weatherForm');
    // Sélectionne le champ de texte pour la ville
    const cityInput = document.getElementById('cityInput');
    // Sélectionne l'élément pour afficher les erreurs
    const errorElement = document.getElementById('error');
    // Sélectionne l'élément de chargement
    const loadingElement = document.getElementById('loading');
    // Sélectionne l'élément pour afficher les résultats météo
    const weatherResultElement = document.getElementById('weatherResult');
    // Sélectionne le bouton d'annulation
    const cancelRequestButton = document.getElementById('cancelRequest');

    // Variable pour stocker le contrôleur d'annulation de la requête en cours pour pouvoir l'annuler
    let controller;

    // Ajoute un écouteur d'événement au formulaire pour la soumission
    form.addEventListener('submit', async (e) => {
        // Empêche le formulaire de soumettre et de recharger la page
        e.preventDefault();
        // Récupère la valeur du champ de texte et supprime les espaces inutiles avant et après
        const city = cityInput.value.trim();
        // Vérifie si la ville est valide à l'aide de la fonction validateCity et affiche un message d'erreur si elle ne l'est pas
        if (!validateCity(city)) {
            // Affiche un message d'erreur si la validation échoue et arrête l'exécution du code
            errorElement.textContent = 'Veuillez entrer une ville valide.';
            return;
        }

        // Réinitialise le message d'erreur et le contenu des résultats météo avant de lancer une nouvelle requête
        errorElement.textContent = '';
        weatherResultElement.innerHTML = '';
        // Affiche les éléments de chargement et le bouton d'annulation pour indiquer que la requête est en cours
        loadingElement.style.display = 'block';
        cancelRequestButton.style.display = 'block';

        // Annule la requête en cours si un contrôleur existant est trouvé pour éviter les requêtes multiples
        if (controller) {
            controller.abort();
        }

        // Crée un nouveau contrôleur d'annulation et récupère son signal pour l'utiliser dans la requête fetch
        controller = new AbortController();
        const signal = controller.signal;

        try {
            // Clé API
            const apiKey = '76c0175fa934d8270784ee25bb83550a';
            // Envoie la requête HTTP asynchrone à l'API OpenWeatherMap
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=fr`, { signal });

            // Vérifie si la réponse HTTP est correcte
            if (!response.ok) {
                throw new Error('Erreur de requête');
            }

            // Convertit la réponse en JSON
            const data = await response.json();
            // Affiche les résultats météo
            displayWeather(data);
        } catch (error) {
            // Gère les erreurs en affichant un message pour l'annulation ou un message général pour d'autres erreurs
            if (error.name === 'AbortError') {
                errorElement.textContent = 'Requête annulée.';
            } else {
                errorElement.textContent = 'Erreur lors de la récupération des données météo.';
            }
        } finally {
            // Masque toujours les éléments de chargement et le bouton d'annulation, que la requête soit réussie ou non
            loadingElement.style.display = 'none';
            cancelRequestButton.style.display = 'none';
        }
    });

    // Ajoute un écouteur d'événement pour le bouton d'annulation qui annule la requête en cours
    cancelRequestButton.addEventListener('click', () => {
        if (controller) {
            controller.abort();
        }
    });

    // Fonction de validation de la ville
    function validateCity(city) {
        // Expression régulière pour vérifier que la ville ne contient que des lettres et qu'elle respecte le format spécifié
        const regex = /^[A-Z][a-z]*(?: [A-Z][a-z]*)*$/;
        // Renvoie vrai si la ville est valide, sinon faux
        return regex.test(city);
    }

    // Fonction pour afficher les résultats météo
    function displayWeather(data) {
        // Récupère les informations nécessaires de l'objet data et les stocke dans des variables
        const weatherDescription = data.weather[0].description;
        const weatherIcon = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
        const temperature = data.main.temp;
        const feelsLike = data.main.feels_like;
        const dt = new Date(data.dt * 1000).toLocaleString('fr-FR');
        const sunrise = new Date(data.sys.sunrise * 1000).toLocaleString('fr-FR');
        const sunset = new Date(data.sys.sunset * 1000).toLocaleString('fr-FR');
        const tempDiff = ((Math.abs(feelsLike - temperature) / temperature) * 100).toFixed(2);

        // Affiche les résultats dans weatherResultElement en utilisant les informations récupérées
        weatherResultElement.innerHTML = `
            <p>Condition: ${weatherDescription}</p>
            <img src="${weatherIcon}" alt="Icone météo">
            <p>Température: ${temperature}°C</p>
            <p>Température ressentie: ${feelsLike}°C</p>
            <p>Date: ${dt}</p>
            <p>Lever du soleil: ${sunrise}</p>
            <p>Coucher du soleil: ${sunset}</p>
            <p>Écart entre la température ressentie et réelle: ${tempDiff}%</p>
        `;
    }
});