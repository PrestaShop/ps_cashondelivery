{**
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
 *}

<section id="ps_cashondelivery-displayOrderConfirmation">
  <p>{l s='Your order on %s is complete.' sprintf=[$shop_name] d='Modules.Cashondelivery.Shop'}</p>
  <p>{l s='You have chosen the cash on delivery method.' d='Modules.Cashondelivery.Shop'}</p>
  <p>{l s='Your order will be sent very soon.' d='Modules.Cashondelivery.Shop'}</p>
  <p>{l s='For any questions or for further information, please contact our' d='Modules.Cashondelivery.Shop'} <a href="{$contact_url}" rel="nofollow">{l s='customer support' d='Modules.Cashondelivery.Shop'}</a>.</p>
</section>
