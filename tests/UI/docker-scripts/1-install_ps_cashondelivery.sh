#!/bin/sh
set -eu

cd "$(dirname $0)" || exit 1

echo "* [$MODULE_NAME] Copying module..."
cp -r /tmp/ps_cashondelivery /var/www/html/modules/

echo "* [$MODULE_NAME] Setting permissions..."
cd /var/www/html/
chown -R www-data:www-data modules/ps_cashondelivery
chmod -R 755 modules/ps_cashondelivery

echo "* [$MODULE_NAME] Installing the module..."
runuser -g www-data -u www-data -- php -d memory_limit=-1 bin/console prestashop:module --no-interaction install "$MODULE_NAME"