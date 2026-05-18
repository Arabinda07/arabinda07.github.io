<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title>XML Sitemap — Arabinda Saha</title>
        <meta name="robots" content="noindex, follow"/>
        <style>
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#333;max-width:960px;margin:0 auto;padding:2rem 1rem}
          h1{font-size:1.5rem;font-weight:600;margin-bottom:.25rem}
          p.desc{color:#666;font-size:.875rem;margin-bottom:1.5rem}
          table{width:100%;border-collapse:collapse;font-size:.875rem}
          th{text-align:left;padding:.75rem .5rem;border-bottom:2px solid #e5e5e5;color:#888;font-weight:500;text-transform:uppercase;font-size:.75rem;letter-spacing:.05em}
          td{padding:.75rem .5rem;border-bottom:1px solid #f0f0f0}
          tr:hover td{background:#fafafa}
          a{color:#2563eb;text-decoration:none}
          a:hover{text-decoration:underline}
          .priority{font-variant-numeric:tabular-nums}
        </style>
      </head>
      <body>
        <h1>XML Sitemap</h1>
        <p class="desc">This is the search engine index for arabinda07.github.io. It lists the public pages discoverable on the web.</p>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Last Modified</th>
              <th>Change Freq</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="sitemap:urlset/sitemap:url">
              <xsl:sort select="sitemap:priority" order="descending"/>
              <tr>
                <td><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a></td>
                <td><xsl:value-of select="sitemap:lastmod"/></td>
                <td><xsl:value-of select="sitemap:changefreq"/></td>
                <td class="priority"><xsl:value-of select="sitemap:priority"/></td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
