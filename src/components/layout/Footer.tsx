import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppShell, Group, Anchor, Text } from '@mantine/core';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <AppShell.Footer p="md">
      <Group justify="space-between">
        <Text size="sm">&copy; 2025 LumaTrip. {t('all_rights_reserved')}</Text>
        <Group>
          <Anchor href="#" size="sm">{t('about')}</Anchor>
          <Anchor href="#" size="sm">{t('privacy_policy')}</Anchor>
          <Anchor href="#" size="sm">{t('terms_of_service')}</Anchor>
        </Group>
      </Group>
    </AppShell.Footer>
  );
};

export default Footer;