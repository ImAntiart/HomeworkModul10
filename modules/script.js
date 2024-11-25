/* класс отвечающий за работу с dom деревом */
class ProductDOM {
  static create(product) {
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
    
      return productItem
  }

  static createProductDescription(product, productDOM) {
      // Создаем внутренний контейнер для остальных элементов
      const productItemDescription = document.createElement('div');
      productItemDescription.className = 'productItemDescription'
    
      // Добавляем заголовок
      const titleElement = document.createElement('h3');
      titleElement.textContent = product.title;
      productItemDescription.appendChild(titleElement)
    
      // Добавляем цену
      const priceElement = document.createElement('p');
      priceElement.textContent = `Цена: $${product.price.toFixed(2)}`;
      productItemDescription.appendChild(priceElement)
    
      // Добавляем описание
      const descriptionElement = document.createElement('p');
      descriptionElement.textContent = `${product.description.substring(0, 100)}...`;
      productItemDescription.appendChild(descriptionElement)
    
      // Добавляем кнопку удаления
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = 'Удалить';
      productItemDescription.appendChild(deleteBtn);
    
      deleteBtn.addEventListener('click', async () => {
        try {
          await ProductAPI.delete(product.id)
          productDOM.remove();
          showNotification('Товар успешно удален!');
        } catch (error) {
          console.error('Произошла ошибка:', error);
          showNotification('Ошибка при удалении товара. Попробуйте позже.');
        }
      });
    
      return productItemDescription
  }

  static createProductList(productList) {
      const productListDOM = document.querySelector('#productsList');
      productListDOM.innerHTML = '';
      
      productList.forEach((product) => {
        const productDOM = ProductDOM.create(product)
        const productDescriptionDOM = ProductDOM.createProductDescription(product, productDOM)
        productDOM.appendChild(productDescriptionDOM); // Добавляем внутренний контейнер внутрь внешнего контейнера
      
        productListDOM.appendChild(productDOM);
      });
  }
}

/* класс отвечающий за работу с api продукта, благодаря тому что все адреса собраны в 1-ом месте, в будущем нам не составит труда поменять его 
и добавить доп. логику для всех запросов при необходимости */
class ProductAPI {
  static async create(productEvent) {
      // productEvent - e.target
      const formData = new FormData(productEvent);

      const response = await fetch('https://fakestoreapi.com/products', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Ошибка при добавлении товара');
  
      return response.json();
  }

  static async delete(productId) {
      await fetch(`https://fakestoreapi.com/products/${productId}`, {
          method: 'DELETE'
      });
  }

  static async getProducts(selectedCategory, limit) {
      let url = `https://fakestoreapi.com/products?limit=${limit}`;
      if (selectedCategory !== '') {
        url += `?category=${selectedCategory}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Ошибка при загрузке товаров');

      return response.json();
  }

  static async getCategories() {
      const response = await fetch('https://fakestoreapi.com/products/categories');
      if (!response.ok) throw new Error('Не удалось получить категории');

      return response.json();
  }
}

class Application {
  registerCreateProductEvent() {
    document.getElementById('addProductForm').addEventListener('submit', async (e) => {
      e.preventDefault();
    
      try {
        const product = await ProductAPI.create(e.target)
        showNotification(`Товар успешно добавлен! ID: ${product.id}`);
        this.displayProducts(); // Обновляем список товаров
      } catch (error) {
        console.error('Произошла ошибка:', error);
        showNotification('Ошибка при добавлении товара. Попробуйте позже.');
      }
    });
  }

  registerCategoryFilterEvent() {
    // Добавил этот обработчик события к элементу select
    document.getElementById('categoryFilter').addEventListener('change', () => {
      const selectedCategory = document.getElementById('categoryFilter').value;
      this.displayProducts(selectedCategory);
    });
  }

  registerWindowOnloadEvent() {
    // Вызываем функцию при загрузке страницы
    window.onload = () => { 
      this.displayProducts(); // Отображаем все товары по умолчанию
    };
  }

  async fetchCategories() {
    try {
      const categories = await ProductAPI.getCategories()
  
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

  async displayProducts(selectedCategory = "", limit = 6) {
    try {
      const products = await ProductAPI.getProducts(selectedCategory, limit)    
  
      const filteredProducts = selectedCategory ? 
        products.filter(product => product.category === selectedCategory) : 
        products;
  
      ProductDOM.createProductList(filteredProducts)
      document.getElementById("loadMore").addEventListener("click", () => {
        this.displayProducts(selectedCategory, limit + 6);
      });
    } catch (error) {
      console.error("Произошла ошибка:", error);
      showNotification("Ошибка при загрузке товара. Попробуйте позже.");
    }
  
    document.addEventListener("DOMContentLoaded", () => {
      this.displayProducts();
    });
  }

  start() {
    // функция для старта приложения в которой выполняются все настройки
    this.registerCreateProductEvent()
    this.registerCategoryFilterEvent()
    // Показываем уведомление об успехе, если всё прошло успешно
    this.fetchCategories().then(() => { showNotification('Категории загружены успешно'); });
    this.registerWindowOnloadEvent()
    this.displayProducts() // Начальная загрузка товаров
  }
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


// старт приложения
const app = new Application()
app.start()
