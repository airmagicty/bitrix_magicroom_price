// NAME: Magicroom Price Auto Fill
// URL: https://magicroom.store/bitrix/admin/cat_product_edit.php?*

function createWidget() {
    // Создаём контейнер
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.backgroundColor = '#f0f0f0';
    container.style.padding = '10px';
    container.style.zIndex = '1000';
    container.style.borderBottom = '1px solid #ccc';

    // Текстария для ввода данных
    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Введите данные (размер возраст цена)';
    textarea.style.width = '400px';
    textarea.style.height = '50px';
    textarea.style.marginBottom = '10px';

    // Кнопка "РАСПОЗНАТЬ"
    const recognizeButton = document.createElement('button');
    recognizeButton.textContent = 'РАСПОЗНАТЬ';
    recognizeButton.style.padding = '5px 10px';
    recognizeButton.style.marginRight = '10px';

    // Кнопка "SAVE"
    const saveButton = document.createElement('button');
    saveButton.textContent = 'SAVE';
    saveButton.style.padding = '5px 10px';
    saveButton.style.marginRight = '10px';

    // Кнопка "UP" (прокрутка вверх)
    const upButton = document.createElement('button');
    upButton.textContent = 'UP';
    upButton.style.padding = '5px 10px';
    upButton.style.marginRight = '10px';

    // Кнопка "DOWN" (прокрутка вниз)
    const downButton = document.createElement('button');
    downButton.textContent = 'DOWN';
    downButton.style.padding = '5px 10px';

    // Текст для вывода результатов
    const resultText = document.createElement('div');
    resultText.style.marginTop = '10px';

    // Текст для вывода распознанных подстановок
    const recognizedText = document.createElement('div');
    recognizedText.style.marginTop = '10px';
    recognizedText.style.color = 'green';

    // Добавляем элементы в контейнер
    container.appendChild(textarea);
    container.appendChild(recognizeButton);
    container.appendChild(saveButton);
    container.appendChild(upButton);
    container.appendChild(downButton);
    container.appendChild(resultText);
    container.appendChild(recognizedText);

    // Добавляем контейнер на страницу
    document.body.prepend(container);

    // Обработчик кнопки "РАСПОЗНАТЬ"
    recognizeButton.addEventListener('click', () => {
        const inputText = textarea.value.trim();
        if (!inputText) {
            alert('Введите данные в текстарии');
            return;
        }

        // Разбиваем текст на строки
        const lines = inputText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        // Проверяем, что первая строка — это заголовок
        if ( !lines[0].startsWith('РАЗМЕР ВОЗРАСТ Цена розница') && !lines[0].startsWith('РАЗМЕР	ВОЗРАСТ	Цена розница (руб.)') ) {
            alert('Первая строка должна быть описанием: "РАЗМЕР ВОЗРАСТ Цена розница"');
            return;
        }

        // Удаляем первую строку (заголовок)
        lines.shift();

        // Парсим данные
        const sizePriceMap = new Map();
        let maxNumericPrice = 0; // Наибольшая цена из числовых размеров
        let symbolicPrice = null; // Цена из символьных размеров
        let unrecognizedLines = [];
        let recognizedSubstitutions = []; // Массив для распознанных подстановок

        lines.forEach((line, index) => {
            const parts = line.split(/\s+/);
            if (parts.length < 3) {
                unrecognizedLines.push(`Строка ${index + 2}: Недостаточно данных`);
                return;
            }

            const size = parts[0];
            const price = parseFloat(parts[parts.length - 1]);

            if (isNaN(price)) {
                unrecognizedLines.push(`Строка ${index + 2}: Неверная цена`);
                return;
            }

            if (!isNaN(parseInt(size))) {
                // Числовой размер
                sizePriceMap.set(size, price);
                recognizedSubstitutions.push(`Размер "${size}" распознан с ценой ${price}`);
                if (price > maxNumericPrice) {
                    maxNumericPrice = price;
                }
            } else {
                // Символьный размер
                sizePriceMap.set(size, price);
                recognizedSubstitutions.push(`Размер "${size}" распознан с ценой ${price}`);
                symbolicPrice = price;
            }
        });

        // Находим все строки таблицы с классом adm-list-table-row adm-table-row-active
        const rows = Array.from(document.querySelectorAll('.adm-list-table-row.adm-table-row-active'));

        let updatedCount = 0;
        let unrecognizedInputs = [];

        rows.forEach(row => {
            // Находим второй select и input внутри строки
            const selects = row.querySelectorAll('select[name^="FIELDS"]');
            const select = selects.length > 1 ? selects[1] : null;
            const input = row.querySelector('input[type="text"][size="9"]');

            if (!select || !input) {
                unrecognizedInputs.push(`Строка не содержит select или input`);
                return;
            }

            // Получаем выбранное значение в select
            const selectedOption = select.querySelector('option:checked');
            if (!selectedOption || !selectedOption.value) {
                unrecognizedInputs.push(`Не выбрано значение в select`);
                return;
            }

            const selectedSize = selectedOption.textContent.trim();
            let price = sizePriceMap.get(selectedSize);

            if (price === undefined) {
                // Если размер числовой, но не найден, используем наибольшую цену из числовых размеров
                if (!isNaN(parseInt(selectedSize))) {
                    price = maxNumericPrice;
                    unrecognizedInputs.push(`Размер "${selectedSize}" не найден в данных, использована максимальная цена (${price})`);
                } 
                // Если размер символьный, но не найден, используем цену из символьных размеров
                else {
                    price = symbolicPrice;
                    unrecognizedInputs.push(`Размер "${selectedSize}" не найден в данных, использована цена из символьных размеров (${price})`);
                }
            }

            // Обновляем значение input
            if (price !== undefined) {
                input.value = price.toFixed(2);
                updatedCount++;
            }
        });

        // Группируем повторяющиеся строки с добавлением "+"
        const groupedUnrecognizedInputs = [];
        let previousLine = null;
        let count = 1;

        unrecognizedInputs.forEach((line, index) => {
            if (line === previousLine) {
                count++;
            } else {
                if (previousLine !== null) {
                    groupedUnrecognizedInputs.push(count > 1 ? `${previousLine} (+${count})` : previousLine);
                }
                previousLine = line;
                count = 1;
            }
        });

        // Добавляем последнюю группу
        if (previousLine !== null) {
            groupedUnrecognizedInputs.push(count > 1 ? `${previousLine} (+${count})` : previousLine);
        }

        // Обновляем текст с результатами
        resultText.innerHTML = `
            Обновлено ${updatedCount} полей.<br>
            Не распознано:<br>
            - Строки:<br>${unrecognizedLines.join('<br>') || 'Нет'}<br>
            - Инпуты:<br>${groupedUnrecognizedInputs.join('<br>') || 'Нет'}
        `;

        // Выводим распознанные подстановки
        recognizedText.innerHTML = `
            Распознанные подстановки:<br>
            ${recognizedSubstitutions.join('<br>') || 'Нет'}
        `;
    });

    // Обработчик кнопки "SAVE"
    saveButton.addEventListener('click', () => {
        const saveButtonElement = document.querySelector('input[type="button"][name="save_sub"]');
        if (saveButtonElement) {
            saveButtonElement.click();
        } else {
            alert('Кнопка сохранения не найдена на странице');
        }
    });

    // Обработчик кнопки "UP"
    upButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Обработчик кнопки "DOWN"
    downButton.addEventListener('click', () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
}

// Вызываем функцию для создания виджета
createWidget();