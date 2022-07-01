<?php
/**
 * Copyright since 2007 PrestaShop SA and Contributors
 * PrestaShop is an International Registered Trademark & Property of PrestaShop SA
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Academic Free License version 3.0
 * that is bundled with this package in the file LICENSE.md.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/AFL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * @author    PrestaShop SA and Contributors <contact@prestashop.com>
 * @copyright Since 2007 PrestaShop SA and Contributors
 * @license   https://opensource.org/licenses/AFL-3.0 Academic Free License version 3.0
 */
if (!defined('_PS_VERSION_')) {
    exit;
}

if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
}

use PrestaShop\PrestaShop\Core\Payment\PaymentOption;

class Ps_Cashondelivery extends PaymentModule
{
    const HOOKS = [
        'displayOrderConfirmation',
        'paymentOptions',
    ];

    const CONFIG_OS_CASH_ON_DELIVERY = 'PS_OS_COD_VALIDATION';

    /**
     * {@inheritdoc}
     */
    public function __construct()
    {
        $this->name = 'ps_cashondelivery';
        $this->tab = 'payments_gateways';
        $this->author = 'PrestaShop';
        $this->version = '2.0.1';
        $this->need_instance = 1;
        $this->ps_versions_compliancy = ['min' => '1.7.6.0', 'max' => _PS_VERSION_];
        $this->controllers = ['validation'];
        $this->currencies = false;

        parent::__construct();

        $this->displayName = $this->trans('Cash on delivery (COD)', [], 'Modules.Cashondelivery.Admin');
        $this->description = $this->trans('Accept cash payments on delivery to make it easy for customers to purchase on your store.', [], 'Modules.Cashondelivery.Admin');
    }

    /**
     * {@inheritdoc}
     */
    public function install()
    {
        return parent::install()
            && (bool) $this->registerHook(static::HOOKS)
            && $this->installOrderState();
    }

    /**
     * @param array{cookie: Cookie, cart: Cart, altern: int} $params
     *
     * @return array|PaymentOption[] Should always returns an array to avoid issue
     */
    public function hookPaymentOptions(array $params)
    {
        if (empty($params['cart'])) {
            return [];
        }

        /** @var Cart $cart */
        $cart = $params['cart'];

        if ($cart->isVirtualCart()) {
            return [];
        }

        $cashOnDeliveryOption = new PaymentOption();
        $cashOnDeliveryOption->setModuleName($this->name);
        $cashOnDeliveryOption->setCallToActionText($this->trans('Pay by Cash on Delivery', [], 'Modules.Cashondelivery.Shop'));
        $cashOnDeliveryOption->setAction($this->context->link->getModuleLink($this->name, 'validation', [], true));
        $cashOnDeliveryOption->setAdditionalInformation($this->fetch('module:ps_cashondelivery/views/templates/hook/paymentOptions-additionalInformation.tpl'));

        return [$cashOnDeliveryOption];
    }

    /**
     * @param array{cookie: Cookie, cart: Cart, altern: int, order: Order, objOrder: Order} $params
     *
     * @return string
     */
    public function hookDisplayOrderConfirmation(array $params)
    {
        /** @var Order $order */
        $order = (isset($params['objOrder'])) ? $params['objOrder'] : $params['order'];

        if (!Validate::isLoadedObject($order) || $order->module !== $this->name) {
            return '';
        }

        $this->context->smarty->assign([
            'shop_name' => $this->context->shop->name,
            'total' => $this->context->getCurrentLocale()->formatPrice($params['order']->getOrdersTotalPaid(), (new Currency($params['order']->id_currency))->iso_code),
            'reference' => $order->reference,
            'contact_url' => $this->context->link->getPageLink('contact', true),
        ]);

        return $this->fetch('module:ps_cashondelivery/views/templates/hook/displayOrderConfirmation.tpl');
    }

    /**
     * @return bool
     */
    public function installOrderState()
    {
        if (Configuration::getGlobalValue(Ps_Cashondelivery::CONFIG_OS_CASH_ON_DELIVERY)) {
            $orderState = new OrderState((int) Configuration::getGlobalValue(Ps_Cashondelivery::CONFIG_OS_CASH_ON_DELIVERY));

            if (Validate::isLoadedObject($orderState) && $this->name === $orderState->module_name) {
                return true;
            }
        }

        return $this->createOrderState(
            static::CONFIG_OS_CASH_ON_DELIVERY,
            [
                'en' => 'Awaiting Cash On Delivery validation',
                'bs' => 'Čeka validaciju Plaćanje po dostavi',
                'ca' => 'Esperant la validació del pagament contra reemborsament',
                'da' => 'Afventer godkendelse af levering pr. efterkrav',
                'de' => 'Warten auf Zahlungseingang Nachnahme',
                'et' => 'Ootab sularaha kauba kättesaamisel kinnitust',
                'es' => 'En espera de validación por contra reembolso.',
                'mx' => 'En espera de validación por pago contra entrega',
                'fr' => 'En attente de paiement à la livraison',
                'qc' => 'En attente de paiement à la livraison',
                'gl' => 'Agardando a validación do Pago Contra Reembolso',
                'hr' => 'Awaiting cod validation',
                'id' => 'Awaiting cod validation',
                'it' => 'In attesa verifica contrassegno',
                'lv' => 'Gaida skaidrās naudas apmaksas apstiprinājumu',
                'hu' => 'Awaiting cod validation',
                'nl' => 'Wachten op bevestiging (rembours)',
                'no' => 'Awaiting cod validation',
                'pl' => 'Oczekiwanie na płatność przy odbiorze',
                'br' => 'Aguardando validação de pagamento na entrega',
                'pt' => 'Awaiting cod validation',
                'ro' => 'In asteptarea confirmarii platii la livrare',
                'sq' => 'Në pritje të pagesës gjatë dorëzimit',
                'sk' => 'Čaká sa na potvrdenie platby dobierkou',
                'sr' => 'Čeka se potvrda keširanja pri isporuci',
                'fi' => 'Odottaa maksuvahvistusta',
                'sv' => 'Väntar på postförskott validering',
                'tr' => 'Kapıda ödeme onayı bekleniyor',
                'lt' => 'Awaiting cod validation',
                'si' => 'Čaka potrdilo za plačilo po povzetju',
                'vn' => 'Chờ xác nhận thanh toán COD',
                'cs' => 'Čeká se na potvrzení dobírky',
                'el' => 'Αναμονή επικύρωσης Αντικαταβολής',
                'ru' => 'Ожидается подтверждение оплаты наличными',
                'uk' => 'Очікується платіж післяплатою',
                'bg' => 'В очакване на валидиране на плащане при доставка',
                'mk' => 'Awaiting cod validation',
                'he' => 'Awaiting cod validation',
                'fa' => 'Awaiting cod validation',
                'hi' => 'Awaiting Cash On Delivery validation',
                'bn' => 'Awaiting cod validation',
                'ar' => 'بإنتظار المصادقة على الدفع عند الإستلام',
                'ja' => '代金引換払い確認待ち',
                'zh' => '接受远程付费',
                'tw' => '等待貨到付款驗證',
                'ko' => '배송시 현금 지불 확인 대기',
            ],
            true === (bool) version_compare(_PS_VERSION_, '1.7.7.0', '>=') ? '#4169E1' : '#34219E'
        );
    }

    /**
     * Create custom OrderState used for payment
     *
     * @param string $configurationKey Configuration key used to store OrderState identifier
     * @param array $nameByLangIsoCode An array of name for all languages, default is en
     * @param string $color Color of the label
     * @param bool $isLogable consider the associated order as validated
     * @param bool $isPaid set the order as paid
     * @param bool $isInvoice allow a customer to download and view PDF versions of his/her invoices
     * @param bool $isShipped set the order as shipped
     * @param bool $isDelivery show delivery PDF
     * @param bool $isPdfDelivery attach delivery slip PDF to email
     * @param bool $isPdfInvoice attach invoice PDF to email
     * @param bool $isSendEmail send an email to the customer when his/her order status has changed
     * @param string $template Only letters, numbers and underscores are allowed. Email template for both .html and .txt
     * @param bool $isHidden hide this status in all customer orders
     * @param bool $isUnremovable Disallow delete action for this OrderState
     * @param bool $isDeleted Set OrderState deleted
     *
     * @return bool
     */
    private function createOrderState(
        $configurationKey,
        array $nameByLangIsoCode,
        $color,
        $isLogable = false,
        $isPaid = false,
        $isInvoice = false,
        $isShipped = false,
        $isDelivery = false,
        $isPdfDelivery = false,
        $isPdfInvoice = false,
        $isSendEmail = false,
        $template = '',
        $isHidden = false,
        $isUnremovable = true,
        $isDeleted = false
    ) {
        $tabNameByLangId = [];

        foreach ($nameByLangIsoCode as $langIsoCode => $name) {
            foreach (Language::getLanguages(false) as $language) {
                if (Tools::strtolower($language['iso_code']) === $langIsoCode) {
                    $tabNameByLangId[(int) $language['id_lang']] = $name;
                } elseif (isset($nameByLangIsoCode['en'])) {
                    $tabNameByLangId[(int) $language['id_lang']] = $nameByLangIsoCode['en'];
                }
            }
        }

        $orderState = new OrderState();
        $orderState->module_name = $this->name;
        $orderState->name = $tabNameByLangId;
        $orderState->color = $color;
        $orderState->logable = $isLogable;
        $orderState->paid = $isPaid;
        $orderState->invoice = $isInvoice;
        $orderState->shipped = $isShipped;
        $orderState->delivery = $isDelivery;
        $orderState->pdf_delivery = $isPdfDelivery;
        $orderState->pdf_invoice = $isPdfInvoice;
        $orderState->send_email = $isSendEmail;
        $orderState->hidden = $isHidden;
        $orderState->unremovable = $isUnremovable;
        $orderState->template = $template;
        $orderState->deleted = $isDeleted;
        $result = (bool) $orderState->add();

        if (false === $result) {
            $this->_errors[] = sprintf(
                'Failed to create OrderState %s',
                $configurationKey
            );

            return false;
        }

        $result = (bool) Configuration::updateGlobalValue($configurationKey, (int) $orderState->id);

        if (false === $result) {
            $this->_errors[] = sprintf(
                'Failed to save OrderState %s to Configuration',
                $configurationKey
            );

            return false;
        }

        $orderStateImgPath = $this->getLocalPath() . 'views/img/orderstate/' . $configurationKey . '.gif';

        if (false === (bool) Tools::file_exists_cache($orderStateImgPath)) {
            $this->_errors[] = sprintf(
                'Failed to find icon file of OrderState %s',
                $configurationKey
            );

            return false;
        }

        if (false === (bool) Tools::copy($orderStateImgPath, _PS_ORDER_STATE_IMG_DIR_ . $orderState->id . '.gif')) {
            $this->_errors[] = sprintf(
                'Failed to copy icon of OrderState %s',
                $configurationKey
            );

            return false;
        }

        return true;
    }
}
