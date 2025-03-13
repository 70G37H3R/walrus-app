#!/bin/sh

set -e  # Exit immediately on error

# Set default ports if not provided via environment variables
SUI_PORT=${SUI_PORT:-9000}
WALRUS_PORT=${WALRUS_PORT:-9001}
SUI_METRICS_PORT=${SUI_METRICS_PORT:-9098}
WALRUS_METRICS_PORT=${WALRUS_METRICS_PORT:-9099}

# Ensure required commands exist
for cmd in sui walrus netstat; do
    if ! command -v "$cmd" > /dev/null 2>&1; then
        echo "❌ '$cmd' command not found!"
        if [ "$cmd" = "netstat" ]; then
            echo "🔧 Installing missing 'netstat'..."
            apt update && apt install -y net-tools
        else
            exit 1
        fi
    fi
done

# Ensure netstat is available after installation
command -v netstat > /dev/null 2>&1 || { echo "❌ 'netstat' installation failed! Exiting..."; exit 1; }

# Function to check and free a port
free_port() {
    PORT=$1
    if netstat -tulnp | grep -q ":$PORT "; then
        echo "⚠️ Port $PORT is already in use! Stopping the process..."
        PID=$(netstat -tulnp | awk -v port=":$PORT" '$4 ~ port {print $7}' | cut -d'/' -f1)
        if [ -n "$PID" ]; then
            kill -9 "$PID" || echo "⚠️ Failed to kill process on port $PORT"
        fi
        sleep 2
    fi
}

# Free any conflicting ports
free_port "$SUI_PORT"
free_port "$WALRUS_PORT"
free_port "$SUI_METRICS_PORT"
free_port "$WALRUS_METRICS_PORT"

# Ensure Walrus configuration exists
CONFIG_PATH="/root/.walrus/config.toml"
if [ ! -f "$CONFIG_PATH" ]; then
    echo "⚠️ Walrus config not found, creating a new one..."
    mkdir -p /root/.walrus
    cat <<EOF > "$CONFIG_PATH"
[settings]
sub_wallets_dir = "/root/wallets"
log_level = "info"
EOF
fi

# Ensure Wallet Configuration Exists
WALLET_DIR="/root/wallets"
WALLET_PATH="$WALLET_DIR/wallet.json"
if [ ! -d "$WALLET_DIR" ]; then
    echo "📂 Creating wallet directory..."
    mkdir -p "$WALLET_DIR"
fi

if [ ! -f "$WALLET_PATH" ]; then
    echo "⚠️ Wallet config not found, checking existing Sui wallet..."

    # Check if Sui wallet directory exists
    if [ -d "~/.sui/sui_config" ]; then
        echo "✅ Found existing Sui wallet. Skipping wallet generation."
    else
        echo "⚠️ No existing wallet found. Generating a new one..."
        walrus generate-sui-wallet --path "$WALLET_DIR"

        if [ $? -ne 0 ]; then
            echo "❌ Failed to generate wallet!"
            exit 1
        fi
    fi
fi

# Start services with dynamic ports
echo "🚀 Starting Sui Faucet on port $SUI_PORT..."
sui faucet start --port "$SUI_PORT" &

echo "🚀 Starting Walrus Publisher on port $WALRUS_PORT..."
walrus publisher --sub-wallets-dir "$WALLET_DIR" --metrics-address "0.0.0.0:$WALRUS_METRICS_PORT" &

echo "🚀 Starting Walrus Aggregator..."
walrus aggregator &

# Ensure script waits for background processes
wait
