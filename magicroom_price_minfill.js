function createInterface() {
    // Создаём контейнер
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.backgroundColor = '#f0f0f0';
    container.style.padding = '10px';
    container.style.zIndex = '1000';
    container.style.borderBottom = '1px solid #ccc';

    // Текст
    const text = document.createElement('span');
    text.textContent = 'Изменено 0 инпутов на Значение';
    text.style.marginRight = '10px';

    // Поле ввода
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.placeholder = 'Введите значение';
    inputField.style.marginRight = '10px';

    // Кнопка "Применить"
    const applyButton = document.createElement('button');
    applyButton.textContent = 'Применить';
    applyButton.style.padding = '5px 10px';
    applyButton.style.marginRight = '10px';

    // Кнопка "UP" (прокрутка вверх)
    const upButton = document.createElement('button');
    upButton.textContent = 'UP';
    upButton.style.padding = '5px 10px';
    upButton.style.marginRight = '10px';

    // Кнопка "DOWN" (прокрутка вниз)
    const downButton = document.createElement('button');
    downButton.textContent = 'DOWN';
    downButton.style.padding = '5px 10px';
    downButton.style.marginRight = '10px';

    // Кнопка "SAVE" (сохранение формы)
    const saveButton = document.createElement('button');
    saveButton.textContent = 'SAVE';
    saveButton.style.padding = '5px 10px';

    // Добавляем элементы в контейнер
    container.appendChild(text);
    container.appendChild(inputField);
    container.appendChild(applyButton);
    container.appendChild(upButton);
    container.appendChild(downButton);
    container.appendChild(saveButton);

    // Добавляем контейнер на страницу
    document.body.prepend(container);

    // Обработчик кнопки "Применить"
    applyButton.addEventListener('click', () => {
        let value = inputField.value.trim();
        value = parseInt(value, 10); // Преобразуем в целое число

        // Проверяем, является ли значение корректным числом
        if (isNaN(value)) {
            alert('Введите корректное числовое значение');
            return;
        }

        // Находим все подходящие input элементы
        const inputs = Array.from(document.querySelectorAll('input[type="text"][size="9"]')).filter(input => {
            const nameMatch = input.name.match(/^CATALOG_PRICE\[\d+\]\[\d+\]$/);
            const idMatch = input.id.match(/^CATALOG_PRICE\[\d+\]\[\d+\]$/);
            return nameMatch && idMatch;
        });

        // Устанавливаем новое значение
        inputs.forEach(input => {
            input.value = value;
        });

        // Обновляем текст
        text.textContent = `Изменено ${inputs.length} инпутов на ${value}`;
    });

    // Обработчик кнопки "UP"
    upButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Обработчик кнопки "DOWN"
    downButton.addEventListener('click', () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });

    // Обработчик кнопки "SAVE"
    saveButton.addEventListener('click', () => {
        const saveButtonElement = document.querySelector('input[type="button"][name="save_sub"]');
        if (saveButtonElement) {
            saveButtonElement.click(); // Программно нажимаем на кнопку
        } else {
            alert('Кнопка сохранения не найдена на странице');
        }
    });
}

// Вызываем функцию для создания интерфейса
createInterface();