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

/**
 * Update main function for module Version 2.0.0
 *
 * @param Ps_Cashondelivery $module
 *
 * @return bool
 */
function upgrade_module_2_0_0($module)
{
    $orderStateId = (int) Configuration::get('PS_OS_COD_VALIDATION');
    $orderState = new OrderState($orderStateId);

    // If OrderState is not exist, we create it, but it should be installed at PrestaShop setup
    if (!Validate::isLoadedObject($orderState)) {
        $module->installOrderState();
    }

    // Hook displayOrderConfirmation replace hook displayPaymentReturn
    if (!$module->isRegisteredInHook('displayOrderConfirmation')) {
        $module->registerHook('displayOrderConfirmation');
    }

    // Hook paymentOptions must be registered
    if (!$module->isRegisteredInHook('paymentOptions')) {
        $module->registerHook('paymentOptions');
    }

    // Hook displayPaymentReturn is no longer used
    if ($module->isRegisteredInHook('displayPaymentReturn')) {
        $module->unregisterHook('displayPaymentReturn');
    }

    return true;
}
