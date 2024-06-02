function showSearchResults() {
    var searchResults = document.getElementById("busqueda-resultados");
    searchResults.innerHTML = "";
    searchResults.style.display = "block";
}

function hideSearchResults() {
    var searchResults = document.getElementById("busqueda-resultados");
  }

function filterProducts() {
    var input = document.getElementById("busqueda").value.trim().toUpperCase();
    var searchResults = document.getElementById("busqueda-resultados");
    

    searchResults.innerHTML = "";

    if (input === "") {
        hideSearchResults();
        return;
    }

    showSearchResults();

var products = document.querySelectorAll(".products-1");
    var foundResults = 0;
    products.forEach(function(product) {
        var productName = product.querySelector("h1").innerText.toUpperCase();
        if (productName.includes(input) && foundResults < 5) {
            var url = product.getAttribute("data-url");
            var resultItem = document.createElement("a");
            resultItem.href = url;
            resultItem.textContent = productName;
            resultItem.style.color = "black";
            var listItem = document.createElement("div");
            listItem.appendChild(resultItem);
            searchResults.appendChild(listItem);
            foundResults++;
        }
    });

    if (!foundResults) {
        var searchNotFound = document.createElement("div");
        searchNotFound.textContent = "Resultados no encontrados";
        searchNotFound.style.color = "#8d0e0e";
        searchNotFound.style.margin = "10px";
        searchResults.appendChild(searchNotFound);
    }
}

document.getElementById("busqueda").addEventListener("input", filterProducts);
document.getElementById("busqueda").addEventListener("focus", filterProducts);
document.getElementById("busqueda").addEventListener("blur", hideSearchResults);
