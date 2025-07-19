<template>
    <div class="credit-card-form">
        <h3>Card Information</h3>

        <div class="form-group">
            <label for="cardNumber" class="form-label">Card Number</label>
            <div class="card-input-wrapper">
                <input id="cardNumber" v-model="localForm.cardNumber" type="text" class="form-input"
                    :class="{ 'form-error-input': errors.cardNumber }" placeholder="1234 5678 9012 3456" maxlength="19"
                    @input="formatCardNumber" @blur="validateCardNumber" required />
                <div class="card-type-icon">
                    <span v-if="cardType">{{ getCardIcon(cardType) }}</span>
                </div>
            </div>
            <div v-if="errors.cardNumber" class="form-error">{{ errors.cardNumber }}</div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="expiryDate" class="form-label">Expiry Date</label>
                <input id="expiryDate" v-model="localForm.expiryDate" type="text" class="form-input"
                    :class="{ 'form-error-input': errors.expiryDate }" placeholder="MM/YY" maxlength="5"
                    @input="formatExpiryDate" @blur="validateExpiryDate" required />
                <div v-if="errors.expiryDate" class="form-error">{{ errors.expiryDate }}</div>
            </div>

            <div class="form-group">
                <label for="cvv" class="form-label">CVV</label>
                <input id="cvv" v-model="localForm.cvv" type="text" class="form-input"
                    :class="{ 'form-error-input': errors.cvv }" placeholder="123" maxlength="4" @input="formatCVV"
                    @blur="validateCVV" required />
                <div v-if="errors.cvv" class="form-error">{{ errors.cvv }}</div>
            </div>
        </div>

        <div class="form-group">
            <label for="cardName" class="form-label">Name on Card</label>
            <input id="cardName" v-model="localForm.cardName" type="text" class="form-input"
                :class="{ 'form-error-input': errors.cardName }" placeholder="John Doe" @blur="validateCardName"
                required />
            <div v-if="errors.cardName" class="form-error">{{ errors.cardName }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';

interface CreditCardFormData {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardName: string;
}

interface Props {
    modelValue: CreditCardFormData;
}

interface Emits {
    (e: 'update:modelValue', value: CreditCardFormData): void;
    (e: 'validationChange', isValid: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const localForm = reactive<CreditCardFormData>({ ...props.modelValue });
const cardType = ref('');

const errors = reactive({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
});

const formatCardNumber = (event: Event) => {
    const target = event.target as HTMLInputElement;
    let value = target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    const matches = value.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
        localForm.cardNumber = parts.join(' ');
        detectCardType(match);
    } else {
        localForm.cardNumber = value;
    }

    if (errors.cardNumber) {
        errors.cardNumber = '';
    }
};

const detectCardType = (number: string) => {
    const patterns = {
        visa: /^4/,
        mastercard: /^5[1-5]/,
        amex: /^3[47]/,
        discover: /^6(?:011|5)/
    };

    for (const [type, pattern] of Object.entries(patterns)) {
        if (pattern.test(number)) {
            cardType.value = type;
            return;
        }
    }
    cardType.value = '';
};

const getCardIcon = (type: string) => {
    const icons: Record<string, string> = {
        visa: '💳',
        mastercard: '💳',
        amex: '💳',
        discover: '💳'
    };
    return icons[type] ?? '💳';
};

const formatExpiryDate = (event: Event) => {
    const target = event.target as HTMLInputElement;
    let value = target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    localForm.expiryDate = value;

    if (errors.expiryDate) {
        errors.expiryDate = '';
    }
};

const formatCVV = (event: Event) => {
    const target = event.target as HTMLInputElement;
    localForm.cvv = target.value.replace(/\D/g, '');
    if (errors.cvv) {
        errors.cvv = '';
    }
};

const validateCardNumber = () => {
    const cleanNumber = localForm.cardNumber.replace(/\s/g, '');

    if (!cleanNumber) {
        errors.cardNumber = 'Card number is required';
        return false;
    }

    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
        errors.cardNumber = 'Please enter a valid card number';
        return false;
    }

    if (!luhnCheck(cleanNumber)) {
        errors.cardNumber = 'Please enter a valid card number';
        return false;
    }

    errors.cardNumber = '';
    return true;
};

const validateExpiryDate = () => {
    if (!localForm.expiryDate) {
        errors.expiryDate = 'Expiry date is required';
        return false;
    }

    const [month, year] = localForm.expiryDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (!month || !year || month < '01' || month > '12') {
        errors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
        return false;
    }

    if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        errors.expiryDate = 'Card has expired';
        return false;
    }

    errors.expiryDate = '';
    return true;
};

const validateCVV = () => {
    if (!localForm.cvv) {
        errors.cvv = 'CVV is required';
        return false;
    }

    if (localForm.cvv.length < 3 || localForm.cvv.length > 4) {
        errors.cvv = 'Please enter a valid CVV';
        return false;
    }

    errors.cvv = '';
    return true;
};

const validateCardName = () => {
    if (!localForm.cardName.trim()) {
        errors.cardName = 'Name on card is required';
        return false;
    }

    errors.cardName = '';
    return true;
};

const luhnCheck = (num: string) => {
    let arr = (num + '')
        .split('')
        .reverse()
        .map(x => parseInt(x));
    let lastDigit = arr.splice(0, 1)[0];
    let sum = arr.reduce((acc, val, i) => (i % 2 !== 0 ? acc + val : acc + ((val * 2) % 9) || 9), 0);
    sum += lastDigit;
    return sum % 10 === 0;
};

const checkFormValidity = () => {
    const isValid = localForm.cardNumber &&
        localForm.expiryDate &&
        localForm.cvv &&
        localForm.cardName &&
        !errors.cardNumber &&
        !errors.expiryDate &&
        !errors.cvv &&
        !errors.cardName;

    emit('validationChange', Boolean(isValid));
    return Boolean(isValid);
};

// Watchers
watch(localForm, (newValue) => {
    emit('update:modelValue', { ...newValue });
    checkFormValidity();
}, { deep: true });

watch(errors, () => {
    checkFormValidity();
}, { deep: true });
</script>

<style scoped>
.credit-card-form {
    margin-bottom: 2rem;
}

.credit-card-form h3 {
    margin-bottom: 1rem;
    color: var(--text-color);
}

.card-input-wrapper {
    position: relative;
}

.card-type-icon {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.25rem;
}

.form-error-input {
    border-color: var(--danger-color) !important;
}

.form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

@media (max-width: 768px) {
    .form-row {
        grid-template-columns: 1fr;
    }
}
</style>