import { addDestination, getTripInfo } from './js/app';
import './styles/style.scss';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-destination').addEventListener('click', () => {
        const city = document.getElementById('city').value;
        const date = document.getElementById('date-input').value;
        if (city && date) {
            addDestination(city, date);
            document.getElementById('city').value = '';
            document.getElementById('date-input').value = '';
        }
    });

    document.getElementById('generate-trip-info').addEventListener('click', () => {
        const city = document.getElementById('city').value;
        if (city) {
            getTripInfo(city);
        }
    });
});
