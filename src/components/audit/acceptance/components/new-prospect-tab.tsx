"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NewProspectForm } from "./use-acceptance-workflow";

interface NewProspectTabProps {
  submitting: boolean;
  onSubmit: (form: NewProspectForm) => Promise<void>;
}

export function NewProspectTab({ submitting, onSubmit }: NewProspectTabProps) {
  const [company, setCompany] = useState("");
  const [source, setSource] = useState("inbound");
  const [industry, setIndustry] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fee, setFee] = useState("");
  const [referredBy, setReferredBy] = useState("");

  function reset() {
    setCompany("");
    setSource("inbound");
    setIndustry("");
    setContact("");
    setEmail("");
    setPhone("");
    setFee("");
    setReferredBy("");
  }

  async function handleSubmit() {
    await onSubmit({ company, source, industry, contact, email, phone, fee, referredBy });
    reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          إضافة عميل محتمل جديد
        </CardTitle>
        <CardDescription>
          أدخل معلومات العميل المحتمل لبدء عملية القبول
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>اسم الشركة *</Label>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="الشركة السعودية القابضة"
            />
          </div>
          <div className="space-y-2">
            <Label>المصدر</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="inbound">واردة</SelectItem>
                <SelectItem value="referral">إحالة</SelectItem>
                <SelectItem value="tender">مناقصة</SelectItem>
                <SelectItem value="existing_client_referral">إحالة عميل حالي</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>القطاع</Label>
            <Input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="مقاولات، طاقة، خدمات..."
            />
          </div>
          <div className="space-y-2">
            <Label>اسم جهة الاتصال</Label>
            <Input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="أحمد محمد"
            />
          </div>
          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="a@company.com"
            />
          </div>
          <div className="space-y-2">
            <Label>رقم الهاتف</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+966 5X XXX XXXX"
            />
          </div>
          <div className="space-y-2">
            <Label>الرسوم التقديرية</Label>
            <Input
              type="number"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="500000"
            />
          </div>
          <div className="space-y-2">
            <Label>مقدم الإحالة</Label>
            <Input
              value={referredBy}
              onChange={(e) => setReferredBy(e.target.value)}
              placeholder="اسم مقدم الإحالة"
            />
          </div>
        </div>
        <Button
          className="mt-4"
          onClick={handleSubmit}
          disabled={submitting || !company.trim()}
        >
          {submitting ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="ml-2 h-4 w-4" />
          )}
          إضافة عميل محتمل
        </Button>
      </CardContent>
    </Card>
  );
}
