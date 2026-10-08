const input = document.getElementById("eanInput");
const btn = document.getElementById("searchButton");

const productInfoEl = document.getElementById("productInfo");
const errorEl = document.getElementById("errorMessage");

// Références sur les champs (ils DOIVENT être présents dans le HTML)
const nameEl = document.getElementById("productName");
const brandEl = document.getElementById("productBrand");
const catEl = document.getElementById("productCategory");
const ingEl = document.getElementById("productIngredients");
const allEl = document.getElementById("productAllergens");
const packEl = document.getElementById("productPackaging");
const imgEl = document.getElementById("productImages");

// Petite fonction utilitaire pour afficher un loader sans détruire la structure
function showLoader() {
  const existing = productInfoEl.querySelector(".loading");
  if (!existing) {
    const p = document.createElement("p");
    p.className = "loading";
    p.textContent = "Chargement des informations...";
    productInfoEl.appendChild(p);
  }
  productInfoEl.style.display = "block";
}
function hideLoader() {
  const existing = productInfoEl.querySelector(".loading");
  if (existing) existing.remove();
}

function resetFields() {
  errorEl.textContent = "";
  nameEl.textContent = "";
  brandEl.textContent = "";
  catEl.textContent = "";
  ingEl.textContent = "";
  allEl.textContent = "";
  packEl.textContent = "";
  imgEl.innerHTML = "";
}

function search() {
  const ean = input.value.trim();
  console.log("Clic sur le bouton de recherche. Code EAN saisi:", ean);

  if (!/^\d{13}$/.test(ean)) {
    console.log("Code EAN invalide:", ean);
    errorEl.textContent = "Veuillez entrer un code EAN valide (13 chiffres).";
    productInfoEl.style.display = "none";
    return;
  }

  console.log("Code EAN valide:", ean);

  // Reset + Loader
  resetFields();
  productInfoEl.style.display = "block";
  showLoader();

  // (Optionnel) Log de l'URL
  console.log("URL appelée :", `https://fr.openfoodfacts.org/api/v0/product/${ean}.json`);

  // Appel API (si CORS pose souci chez toi, remplace l’URL par:
  // `https://corsproxy.io/?https://fr.openfoodfacts.org/api/v0/product/${ean}.json`)
  fetch(`https://fr.openfoodfacts.org/api/v0/product/${ean}.json`)
    .then((response) => response.json())
    .then((data) => {
      console.log("Réponse de l'API:", data);
      hideLoader();

      if (data.status === 0 || !data.product) {
        errorEl.textContent = "Produit non trouvé.";
        productInfoEl.style.display = "none";
        return;
      }

      const product = data.product;
      console.log("Produit trouvé:", product);

      nameEl.textContent = product.product_name || "Nom non disponible";
      brandEl.textContent = product.brands || "Non spécifiée";
      catEl.textContent = product.categories || "Non spécifiée";
      ingEl.textContent = product.ingredients_text || "Non disponibles";

      const allergens = product.allergens_tags
        ? product.allergens_tags.map((a) => a.replace(/^..:/, "")).join(", ")
        : "Non spécifiés";
      allEl.textContent = allergens;

      packEl.textContent = product.packaging || "Non spécifié";

      if (product.image_url) {
        imgEl.innerHTML = `<img src="${product.image_url}" alt="${product.product_name || "Produit"}">`;
      }

      productInfoEl.style.display = "block";
    })
    .catch((error) => {
      console.error("Erreur API:", error);
      hideLoader();
      errorEl.textContent = "Erreur lors de la récupération des données.";
      productInfoEl.style.display = "none";
    });
}

btn.addEventListener("click", function (event) {
  event.preventDefault();
  search();
});

// Entrée clavier pour lancer la recherche
input.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    search();
  }
});


