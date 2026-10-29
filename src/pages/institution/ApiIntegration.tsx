import React, { useState } from 'react';
import {
  KeyRound,
  Copy,
  RotateCw,
  Trash2,
  Check,
  Send,
  Webhook,
  Code2,
  ExternalLink,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const ApiIntegration: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [apiKey, setApiKey] = useState('adv_live_981240182930491823a8bc72');
  const [copied, setCopied] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://erp.coep.ac.in/webhooks/aicte-apaar');
  const [webhookSecret, setWebhookSecret] = useState('whsec_884192049182390192');
  const [eventStudentValidated, setEventStudentValidated] = useState(true);
  const [eventStudentFlagged, setEventStudentFlagged] = useState(true);
  const [eventQuotaAlert, setEventQuotaAlert] = useState(true);

  // Test Ping state
  const [isTesting, setIsTesting] = useState(false);
  const [testResponse, setTestResponse] = useState<string | null>(null);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast.success('API Key Copied', 'Token copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRotateKey = () => {
    const newKey = `adv_live_${Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    setApiKey(newKey);
    toast.success('API Key Rotated', 'Previous key invalidated. Update your institutional ERP headers.');
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestResponse(null);

    setTimeout(() => {
      setIsTesting(false);
      setTestResponse(
        JSON.stringify(
          {
            status: '200_OK',
            timestamp: new Date().toISOString(),
            gateway: 'AICTE-APAAR-CENTRAL-API-V2',
            institution_id: user?.institutionId || 'INST102',
            connection: 'ENCRYPTED_TLS_1_3',
            quota_status: 'HEALTHY',
            latency: '42ms'
          },
          null,
          2
        )
      );
      toast.success('Connection Successful', 'Received 200 OK ping from AICTE Gateway.');
    }, 700);
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Webhook Saved', 'Webhook settings and event dispatchers updated.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-[#1E9E5A] tracking-wider uppercase">
          Developer &amp; SIS Interoperability
        </span>
        <h1 className="text-2xl font-bold text-[#14233F] tracking-tight">
          API Management &amp; Integration Hub
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5">
          Programmatic student admission ingest, automated APAAR verification hooks, and endpoint documentation.
        </p>
      </div>

      {/* API Key Management Card */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E3EAE6]">
          <div>
            <h3 className="text-base font-bold text-[#14233F] flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#14513A]" />
              <span>Production API Keys</span>
            </h3>
            <p className="text-xs text-[#8A94A0] mt-0.5">
              Authenticate programmatic HTTP requests using the <code>Bearer</code> token header.
            </p>
          </div>

          <Badge variant="success" dot>Active Key</Badge>
        </div>

        <div>
          <label className="text-xs font-bold text-[#14233F] uppercase tracking-wider block mb-1.5">
            CURRENT PRODUCTION TOKEN
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                readOnly
                value={apiKey}
                className="w-full font-mono text-xs sm:text-sm py-2.5 px-3.5 rounded-xl border border-[#D1DCD6] bg-[#F4F8F6] text-[#14233F] outline-none"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyKey}
              leftIcon={copied ? <Check className="w-4 h-4 text-[#1E9E5A]" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? 'Copied' : 'Copy Key'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotateKey}
              leftIcon={<RotateCw className="w-4 h-4 text-[#F5B335]" />}
            >
              Rotate Key
            </Button>
          </div>
          <span className="text-[11px] text-[#8A94A0] mt-1.5 block">
            Keep this token confidential. Never expose it in client-side code or public repositories.
          </span>
        </div>
      </Card>

      {/* Endpoint Documentation & Test Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Endpoint Docs */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-[#14233F] flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#14513A]" />
                <span>REST Endpoints Documentation</span>
              </h3>
              <p className="text-xs text-[#8A94A0] mt-0.5">
                Standard JSON schema for admissions synchronization.
              </p>
            </div>

            {/* Endpoint 1 */}
            <div className="space-y-2 border border-[#E3EAE6] rounded-xl p-4 bg-[#F4F8F6]/50">
              <div className="flex items-center gap-2">
                <span className="bg-[#14513A] text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                  POST
                </span>
                <span className="font-mono text-xs font-bold text-[#14233F]">
                  /api/v1/students/upload
                </span>
              </div>
              <p className="text-xs text-[#4B5563]">
                Ingest single or batch student admission records keyed by 12-digit APAAR.
              </p>
              
              {/* Sample cURL snippet */}
              <div className="bg-[#14233F] text-slate-200 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto">
                <pre>{`curl -X POST https://api.aicte-india.org/advait/v1/students/upload \\
  -H "Authorization: Bearer ${apiKey.slice(0, 16)}..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "apaar_id": "9824 5510 8392",
    "student_id": "COEP/2024/CS/042",
    "name": "Aarav Rajesh Mehta",
    "programme": "B.Tech",
    "course": "Computer Science",
    "quota_type": "Regular"
  }'`}</pre>
              </div>
            </div>

            {/* Endpoint 2 */}
            <div className="space-y-2 border border-[#E3EAE6] rounded-xl p-4 bg-[#F4F8F6]/50">
              <div className="flex items-center gap-2">
                <span className="bg-[#2F6FDB] text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                  GET
                </span>
                <span className="font-mono text-xs font-bold text-[#14233F]">
                  /api/v1/students/verify?apaar=982455108392
                </span>
              </div>
              <p className="text-xs text-[#4B5563]">
                Verify student validation status and authenticity token.
              </p>
            </div>
          </Card>
        </div>

        {/* Right 5 Cols: Webhook Settings & Ping Sandbox */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#14233F] flex items-center gap-2">
                <Webhook className="w-5 h-5 text-[#14513A]" />
                <span>Webhook Event Dispatcher</span>
              </h3>
              <p className="text-xs text-[#8A94A0] mt-0.5">
                Receive real-time push notifications when AICTE Central Engine flags an issue.
              </p>
            </div>

            <form onSubmit={handleSaveWebhook} className="space-y-3">
              <Input
                label="PAYLOAD TARGET URL"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-domain.edu/webhooks"
                required
              />

              <Input
                label="SIGNING SECRET"
                value={webhookSecret}
                disabled
              />

              <div>
                <label className="text-xs font-bold text-[#14233F] uppercase tracking-wider block mb-2">
                  TRIGGER EVENTS
                </label>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eventStudentValidated}
                      onChange={(e) => setEventStudentValidated(e.target.checked)}
                      className="w-4 h-4 text-[#14513A] rounded border-[#D1DCD6]"
                    />
                    <span>student.validated (Success Ingestion)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eventStudentFlagged}
                      onChange={(e) => setEventStudentFlagged(e.target.checked)}
                      className="w-4 h-4 text-[#14513A] rounded border-[#D1DCD6]"
                    />
                    <span>student.flagged (Format / Duplicate Conflict)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eventQuotaAlert}
                      onChange={(e) => setEventQuotaAlert(e.target.checked)}
                      className="w-4 h-4 text-[#14513A] rounded border-[#D1DCD6]"
                    />
                    <span>institution.quota_alert (Over-Intake Spike)</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  isLoading={isTesting}
                  leftIcon={<Activity className="w-4 h-4 text-[#1E9E5A]" />}
                >
                  Test Connection
                </Button>
                <Button type="submit" size="sm">
                  Save Webhook
                </Button>
              </div>
            </form>

            {/* Test Ping Output */}
            {testResponse && (
              <div className="mt-3 p-3 bg-[#14233F] rounded-xl text-emerald-300 font-mono text-[10px] overflow-x-auto">
                <pre>{testResponse}</pre>
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
};

