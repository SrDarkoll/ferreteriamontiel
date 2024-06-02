const inputcantidad = document.querySelector('.input-cantidad')
const btnIncrement = document.querySelector('#increment')
const btnDecrement = document.querySelector('#decrement')

let ValueByDefault = parseInt(inputcantidad.value)

btnIncrement.addEventListener('click', () => {
    ValueByDefault +=1
    inputcantidad.value =ValueByDefault
    updateValueQuantity();
})

btnDecrement.addEventListener('click', () => {
    if (ValueByDefault === 1){
        return
    }
    ValueByDefault -=1
    inputcantidad.value =ValueByDefault 
    updateValueQuantity();

})


const updateValueQuantity = () => {
    let quantity = parseInt(document.getElementById('cantidad').value);
    let price = parseFloat(document.querySelector('.precio').textContent.replace('$', ''));
    let total = (quantity * price).toFixed(2);
    
    document.getElementById('quantity-product').textContent = quantity;
    document.querySelector('.price-total').textContent = '$' + total;
};

// Llamamos a la función cuando se modifica la cantidad
document.getElementById('cantidad').addEventListener('input', updateValueQuantity);

// Llamamos a la función inicialmente para mostrar el valor total inicial
updateValueQuantity();
