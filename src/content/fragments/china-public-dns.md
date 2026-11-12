---
title: "DoH 列表汇总"
pubDate: "2026-11-11"
description: "国内能连公共 DNS / DoH 汇总。"
tags: ["技术"]
draft: false
---

| 来源 | 地址 | 延迟（中位） | 备注 |
| --- | --- | --- | --- |
| 阿里云 | `https://dns.alidns.com/dns-query`<br>`https://223.5.5.5/dns-query` | ~11ms | 最快；支持 DoT (`dns.alidns.com`)、DoQ、HTTP/3；不转发 ECS 但会按网段切出口 |
| 腾讯 DNSPod | `https://doh.pub/dns-query`<br>`https://1.12.12.12/dns-query` | ~40ms | 最稳；支持 DoT (`dot.pub`)，原样转发 ECS |
| 360 | `https://doh.360.cn/dns-query` | ~50ms | 支持 DoT (`dot.360.cn`)；自带黑名单，会把 `facebook.com`、`twitter.com` 等解析到 `127.0.0.1` |


| 来源 | 地址 | 延迟（中位） | 备注 |
| --- | --- | --- | --- |
| CleanBrowsing（美国） | `https://doh.cleanbrowsing.org/doh/security-filter/` | 195ms | 支持 h1/h2，套了 Cloudflare，拦截恶意软件域名 |
| DeCloudUs（美国） | `https://dns.decloudus.com/dns-query` | 220ms | 仅 h2 |
| Applied Privacy（奥地利） | `https://doh.applied-privacy.net/query` | 337ms | 仅 h2 |
| Digitale Gesellschaft（瑞士） | `https://dns.digitale-gesellschaft.ch/dns-query` | 390ms | 仅 h2 |
| DNS4EU（欧盟） | `https://unfiltered.joindns4.eu/dns-query` | 400ms | 仅 h2，无过滤版 |
| Tiarap / JP-Tiara（日本） | `https://doh.tiarap.org/dns-query` | 491ms | 支持 h1/h2，套了 Cloudflare |
| DNS4EU（欧盟） | `https://protective.joindns4.eu/dns-query` | 570ms | 仅 h2，带广告与恶意域名过滤 |

