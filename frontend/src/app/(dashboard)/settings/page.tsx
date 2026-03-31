"use client";

import { motion } from "framer-motion";
import { User, Bell, Shield, Key, Palette, Globe, Building, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and platform preferences" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="gap-1"><User className="h-3.5 w-3.5" /> Profile</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1"><Bell className="h-3.5 w-3.5" /> Notifications</TabsTrigger>
            <TabsTrigger value="security" className="gap-1"><Shield className="h-3.5 w-3.5" /> Security</TabsTrigger>
            <TabsTrigger value="appearance" className="gap-1"><Palette className="h-3.5 w-3.5" /> Appearance</TabsTrigger>
            <TabsTrigger value="organization" className="gap-1"><Building className="h-3.5 w-3.5" /> Organization</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card glass>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-xl">JD</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">Change Avatar</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>First Name</Label><Input defaultValue="John" className="mt-1" /></div>
                  <div><Label>Last Name</Label><Input defaultValue="Doe" className="mt-1" /></div>
                  <div><Label>Email</Label><Input defaultValue="john.doe@company.com" className="mt-1" /></div>
                  <div><Label>Department</Label><Input defaultValue="Compliance" className="mt-1" /></div>
                  <div><Label>Role</Label><Select defaultValue="admin"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="manager">Manager</SelectItem><SelectItem value="analyst">Analyst</SelectItem></SelectContent></Select></div>
                  <div><Label>Timezone</Label><Select defaultValue="utc"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="utc">UTC</SelectItem><SelectItem value="est">EST</SelectItem><SelectItem value="pst">PST</SelectItem><SelectItem value="cet">CET</SelectItem></SelectContent></Select></div>
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card glass>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "New regulations", description: "Get notified when new regulations are published" },
                  { label: "Audit updates", description: "Updates on audit status and findings" },
                  { label: "Task assignments", description: "When tasks are assigned to you" },
                  { label: "Deadline reminders", description: "Reminders for upcoming compliance deadlines" },
                  { label: "Risk alerts", description: "Alerts when risk scores change significantly" },
                  { label: "Weekly summary", description: "Weekly compliance summary email" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card glass>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Current Password</Label>
                  <Input type="password" className="mt-1 max-w-md" />
                </div>
                <div>
                  <Label>New Password</Label>
                  <Input type="password" className="mt-1 max-w-md" />
                </div>
                <div>
                  <Label>Confirm Password</Label>
                  <Input type="password" className="mt-1 max-w-md" />
                </div>
                <Button>Update Password</Button>
                <Separator />
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
                  <div>
                    <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
                    <p className="text-xs text-slate-500">Add an extra layer of security to your account</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
                  <div>
                    <p className="text-sm font-medium text-white">Session Management</p>
                    <p className="text-xs text-slate-500">Active sessions: 2 devices</p>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card glass>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
                  <div>
                    <p className="text-sm font-medium text-white">Dark Mode</p>
                    <p className="text-xs text-slate-500">Use dark theme across the platform</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
                  <div>
                    <p className="text-sm font-medium text-white">Compact Mode</p>
                    <p className="text-xs text-slate-500">Reduce spacing for more content density</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
                  <div>
                    <p className="text-sm font-medium text-white">Animations</p>
                    <p className="text-xs text-slate-500">Enable motion and transition effects</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organization">
            <Card glass>
              <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
                <CardDescription>Manage organization-wide settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Organization Name</Label><Input defaultValue="Acme Corp" className="mt-1" /></div>
                  <div><Label>Industry</Label><Select defaultValue="financial"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="financial">Financial Services</SelectItem><SelectItem value="healthcare">Healthcare</SelectItem><SelectItem value="technology">Technology</SelectItem></SelectContent></Select></div>
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
