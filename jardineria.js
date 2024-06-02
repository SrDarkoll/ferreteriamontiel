document.addEventListener("DOMContentLoaded", function() {
    const categoryLinks = document.querySelectorAll('.category-item');
    const productItems = document.querySelectorAll('.products-content');

    categoryLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            filterProducts(category);
        });
    });

    function filterProducts(category) {
        productItems.forEach(function(item) {
            const itemCategory = item.getAttribute('category');
            if (category === 'all' || itemCategory === category) {
            // Mostrar solo los productos de la categoría seleccionada o todos si se selecciona 'Todo'
            item.style.display = 'block';
        } else {
            // Ocultar los productos que no pertenecen a la categoría seleccionada
            item.style.display = 'none';
        }
    });
}
});