import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Copy, ExternalLink, MessageCircle } from 'lucide-react';
import wechatQr from '../../assets/wechat-qr.png';
import { QINGHONG_RELAY_SITE } from '../../constants/qinghong-relay';

/** Official support WeChat — do not change without product owner confirmation */
export const QHCODE_WECHAT_ID = 'ziyouxiaoqi123';

type Channel = {
  id: string;
  labelKey: string;
  value: string;
  copyable?: boolean;
  openable?: boolean;
  hintKey: string;
};

const CHANNELS: Channel[] = [
  {
    id: 'wechat',
    labelKey: 'help.channelWechat',
    value: QHCODE_WECHAT_ID,
    copyable: true,
    hintKey: 'help.wechatHint',
  },
  {
    id: 'relay',
    labelKey: 'help.channelRelay',
    value: QINGHONG_RELAY_SITE,
    copyable: true,
    openable: true,
    hintKey: 'help.relayHint',
  },
  {
    id: 'xianyu',
    labelKey: 'help.channelXianyu',
    value: '程序员317呀 / 行囊鱼777',
    copyable: true,
    hintKey: 'help.xianyuHint',
  },
  {
    id: 'taobao',
    labelKey: 'help.channelTaobao',
    value: '晴红的小店',
    copyable: true,
    hintKey: 'help.taobaoHint',
  },
];

export function SettingsHelp() {
  const { t } = useTranslation();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyText = async (id: string, text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const el = document.createElement('textarea');
        el.value = text;
        el.style.position = 'fixed';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* ignore */
    }
  };

  const openUrl = (url: string) => {
    if (window.electronAPI?.openExternal) {
      void window.electronAPI.openExternal(url);
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border bg-surface/60 p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg bg-accent/10 p-2 text-accent">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-text-primary">{t('help.assistantTitle')}</h4>
            <p className="mt-1 text-sm leading-6 text-text-secondary">{t('help.assistantDesc')}</p>
            <p className="mt-2 text-xs text-text-muted">{t('help.remarkTip')}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:gap-6">
          <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
            <img
              src={wechatQr}
              alt={t('help.qrAlt')}
              className="h-44 w-44 object-contain"
              draggable={false}
            />
          </div>
          <div className="min-w-0 flex-1 space-y-3 self-stretch">
            <div>
              <p className="text-xs text-text-muted">{t('help.wechatLabel')}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <code className="select-all rounded-md bg-background px-3 py-1.5 text-base font-semibold tracking-wide text-text-primary">
                  {QHCODE_WECHAT_ID}
                </code>
                <button
                  type="button"
                  onClick={() => copyText('wechat-main', QHCODE_WECHAT_ID)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-hover"
                >
                  {copiedId === 'wechat-main' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-600" />
                      {t('help.copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      {t('help.copy')}
                    </>
                  )}
                </button>
              </div>
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-text-secondary">
              <li>{t('help.useBug')}</li>
              <li>{t('help.useRenew')}</li>
              <li>{t('help.useFeature')}</li>
              <li>{t('help.useGuide')}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-text-primary">{t('help.channelsTitle')}</h4>
        <div className="space-y-2">
          {CHANNELS.map((ch) => (
            <div
              key={ch.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-surface/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary">{t(ch.labelKey)}</p>
                <p className="mt-0.5 break-all text-sm text-text-secondary">{ch.value}</p>
                <p className="mt-1 text-xs text-text-muted">{t(ch.hintKey)}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2 self-start sm:self-center">
                {ch.openable && (
                  <button
                    type="button"
                    onClick={() => openUrl(ch.value)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-hover"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t('help.openLink')}
                  </button>
                )}
                {ch.copyable && (
                  <button
                    type="button"
                    onClick={() => copyText(ch.id, ch.value)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-hover"
                  >
                    {copiedId === ch.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-600" />
                        {t('help.copied')}
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        {t('help.copy')}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border-muted bg-background px-4 py-3 text-xs leading-5 text-text-muted">
        <p>{t('help.disclaimer')}</p>
        <p className="mt-2 inline-flex items-center gap-1">
          <ExternalLink className="h-3 w-3" />
          {t('help.docsHint')}
        </p>
      </div>
    </div>
  );
}
