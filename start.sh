#!/bin/sh
set -eu

config_dir=${SUBWEB_CONFIG_DIR:-/usr/share/nginx/html/conf}
config_file="$config_dir/config.js"
static_config=${SUBWEB_STATIC_CONFIG:-/app/config_static.js}
nginx_bin=${SUBWEB_NGINX_BIN:-nginx}

reject_control_characters() {
  value=$1
  name=$2
  case "$value" in
    *'
'*)
      echo "$name must not contain control characters" >&2
      exit 1
      ;;
  esac
  if printf '%s' "$value" | LC_ALL=C grep -q '[[:cntrl:]]'; then
    echo "$name must not contain control characters" >&2
    exit 1
  fi
}

escape_js_string() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

validate_http_url() {
  case "$1" in
    http://* | https://*) ;;
    *)
      echo "$2 must start with http:// or https://" >&2
      exit 1
      ;;
  esac
}

mkdir -p "$config_dir"

if [ -n "${API_URL:-}${SHORT_URL:-}${SITE_NAME:-}${ENABLE_SHORT_URL:-}" ]; then
  api_url=${API_URL:-https://sub.xeton.dev}
  site_name=${SITE_NAME:-Subconverter Web}
  short_url=${SHORT_URL:-}
  enable_short_url=${ENABLE_SHORT_URL:-false}

  reject_control_characters "$api_url" API_URL
  reject_control_characters "$site_name" SITE_NAME
  reject_control_characters "$short_url" SHORT_URL
  validate_http_url "$api_url" API_URL

  case "$enable_short_url" in
    true | false) ;;
    *)
      echo 'ENABLE_SHORT_URL must be true or false' >&2
      exit 1
      ;;
  esac
  if [ "$enable_short_url" = 'true' ]; then
    validate_http_url "$short_url" SHORT_URL
  fi

  api_json=$(escape_js_string "$api_url")
  site_json=$(escape_js_string "$site_name")
  short_json=$(escape_js_string "$short_url")
  tmp_file="${config_file}.tmp.$$"
  trap 'rm -f "$tmp_file"' EXIT HUP INT TERM

  {
    printf 'window.config = {\n'
    printf '  siteName: "%s",\n' "$site_json"
    printf '  apiBackends: [{ name: "自定义后端", url: "%s" }],\n' "$api_json"
    printf '  enableShortUrl: %s,\n' "$enable_short_url"
    printf '  shortUrl: "%s",\n' "$short_json"
    printf '  menuItem: [\n'
    printf '    { title: "首页", link: "/", target: "" },\n'
    printf '    { title: "GitHub", link: "https://github.com/Aethersailor/subweb", target: "_blank" },\n'
    printf '  ],\n'
    printf '  remoteConfigOptions: [\n'
    printf '    { value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online.ini", text: "ACL4SSR Online" },\n'
    printf '    { value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full.ini", text: "ACL4SSR Online Full" },\n'
    printf '  ],\n'
    printf '};\n'
  } >"$tmp_file"
  mv "$tmp_file" "$config_file"
  trap - EXIT HUP INT TERM
  echo 'Generated runtime configuration from container environment.'
elif [ ! -f "$config_file" ]; then
  cp "$static_config" "$config_file"
  echo 'Installed the privacy-safe default runtime configuration.'
else
  echo 'Using the existing mounted runtime configuration.'
fi

exec "$nginx_bin" -g 'daemon off;'
