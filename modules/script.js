// Функция для отправки запроса при заполнении формы
document.getElementById('addProductForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  try {
    const formData = new FormData(e.target);
    const response = await fetch('https://fakestoreapi.com/products', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Ошибка при добавлении товара');

    const result = await response.json();
    showNotification(`Товар успешно добавлен! ID: ${result.id}`);
    displayProducts(); // Обновляем список товаров
  } catch (error) {
    console.error('Произошла ошибка:', error);
    showNotification('Ошибка при добавлении товара. Попробуйте позже.');
  }
});

// Объявление функций
 async function fetchCategories() {
  try {
    const response = await fetch('https://fakestoreapi.com/products/categories');
    if (!response.ok) {
      throw new Error('Не удалось получить категории');
    }
    const categories = await response.json();

    // Получаем элемент select
    const categorySelect = document.getElementById('categoryFilter');

    // Очищаю существующие опции, кроме первой ("Все категории")
    while (categorySelect.options.length > 1) {
      categorySelect.remove(1);
    }

    // Добавил новые опции для каждой категории
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category.charAt(0).toUpperCase() + category.slice(1); // Приводим первую букву к верхнему регистру
      categorySelect.appendChild(option);
    });


    // Уведомление о том, что категории загружены
    showNotification('Категории загружены успешно');
  } catch (error) {
    console.error('Ошибка:', error);
    showNotification(`Произошла ошибка при получении категорий: ${error.message}`);
  }
}

// Вызовы функций
fetchCategories().then(() => {
  // Показываем уведомление об успехе, если всё прошло успешно
  showNotification('Категории загружены успешно');
});

///
function applyFilter() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  displayProducts(selectedCategory);
}

// Добавил этот обработчик события к элементу select
document.getElementById('categoryFilter').addEventListener('change', applyFilter);

// Вызываем функцию при загрузке страницы
window.onload = () => {
  displayProducts(); // Отображаем все товары по умолчанию
};

//


async function displayProducts(selectedCategory = "", limit = 6) {
  try {
    let url = `https://fakestoreapi.com/products?limit=${limit}`;
    if (selectedCategory !== '') {
      url += `?category=${selectedCategory}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error('Ошибка при загрузке товаров');
    const products = await response.json();
    
    // Прикрутил фильтр товаров по выбранной категории
    const filteredProducts = selectedCategory ? 
      products.filter(product => product.category === selectedCategory) : 
      products;

    const productsList = document.querySelector('#productsList');
    productsList.innerHTML = '';

    filteredProducts.forEach((product) => {
      const productItem = document.createElement('div');
      productItem.className = 'productItem';
 // Создаем внешний контейнер для изображения
 const productItemImg = document.createElement('div');
 productItemImg.className = 'productItemImg';
 
 // Добавляем изображение внутрь внешнего контейнера
 const imageElement = document.createElement('img');
 imageElement.src = product.image;
 imageElement.alt = product.title; 
 productItemImg.appendChild(imageElement);
 productItem.appendChild(productItemImg);

 // Создаем внутренний контейнер для остальных элементов
 const productItemDescription = document.createElement('div');
 productItemDescription.className = 'productItemDescription';

 // Добавляем заголовок
 const titleElement = document.createElement('h3');
 titleElement.textContent = product.title;
 productItemDescription.appendChild(titleElement);

 // Добавляем цену
 const priceElement = document.createElement('p');
 priceElement.textContent = `Цена: $${product.price.toFixed(2)}`;
 productItemDescription.appendChild(priceElement);

 // Добавляем описание
 const descriptionElement = document.createElement('p');
 descriptionElement.textContent = `${product.description.substring(0, 100)}...`;
 productItemDescription.appendChild(descriptionElement);

 // Добавляем кнопку удаления
 const deleteBtn = document.createElement('button');
 deleteBtn.className = 'delete-btn';
 deleteBtn.textContent = 'Удалить';
 productItemDescription.appendChild(deleteBtn);

 // Добавляем внутренний контейнер внутрь внешнего контейнера
 productItem.appendChild(productItemDescription);

 productsList.appendChild(productItem);
      deleteBtn.addEventListener('click', async () => {
        try {
          await fetch(`https://fakestoreapi.com/products/${product.id}`, {
            method: 'DELETE'
          });

          productItem.remove();
          showNotification('Товар успешно удален!');
        } catch (error) {
          console.error('Произошла ошибка:', error);
          showNotification('Ошибка при удалении товара. Попробуйте позже.');
        }
      });
    });
    /////////// Добавил обработчик событий для кнопки "Загрузить еще"
    document.getElementById("loadMore").addEventListener("click", () => {
      displayProducts(selectedCategory, limit + 6);
    });
  } catch (error) {
    console.error("Произошла ошибка:", error);
    showNotification("Ошибка при загрузке товара. Попробуйте позже.");
  }

  document.addEventListener("DOMContentLoaded", () => {
    displayProducts();
  });
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.top = '10px';
  notification.style.right = '10px';
  notification.style.backgroundColor = '#f8d7da';
  notification.style.color = '#721c24';
  notification.style.padding = '10px';
  notification.style.borderRadius = '5px';
  notification.style.zIndex = '1000';

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 5000);
}

displayProducts(); // Начальная загрузка товаров


