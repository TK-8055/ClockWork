import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";

const HomeScreen = ({ navigation }) => {
  const windowWidth = Dimensions.get("window").width;

  const ActionCard = ({ icon, title, desc, bgColor, onPress }) => (
    <TouchableOpacity
      style={[styles.actionCard, { backgroundColor: bgColor }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.cardContent}>
        <View style={styles.iconCircle}>
          <Text style={styles.cardEmoji}>{icon}</Text>
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{desc}</Text>
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>→</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const StatItem = ({ icon, label, value }) => (
    <View style={styles.statItemContainer}>
      <Text style={styles.statItemIcon}>{icon}</Text>
      <Text style={styles.statItemValue}>{value}</Text>
      <Text style={styles.statItemLabel}>{label}</Text>
    </View>
  );

  const JobCategory = ({ icon, name, count }) => (
    <View style={styles.categoryCard}>
      <Text style={styles.categoryIcon}>{icon}</Text>
      <Text style={styles.categoryName}>{name}</Text>
      <Text style={styles.categoryCount}>{count} jobs</Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ===== PREMIUM HEADER ===== */}
      <View style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Welcome back! 👋</Text>
              <Text style={styles.headerTitle}>TempJobFinder</Text>
            </View>
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationIcon}>🔔</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>
            Ready to find your next opportunity?
          </Text>
        </View>
      </View>

      {/* ===== SEARCH BAR ===== */}
      <View style={styles.searchContainer}>
        <TouchableOpacity style={styles.searchBar} activeOpacity={0.7}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Search jobs, skills...</Text>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* ===== QUICK STATS ===== */}
      <View style={styles.quickStatsSection}>
        <Text style={styles.sectionTitle}>Your Dashboard</Text>
        <View style={styles.statsGrid}>
          <StatItem icon="💰" label="Earned Today" value="$150" />
          <StatItem icon="✅" label="Active Jobs" value="3" />
          <StatItem icon="⭐" label="Rating" value="4.8" />
          <StatItem icon="📈" label="In Progress" value="5" />
        </View>
      </View>

      {/* ===== MAIN FEATURES ===== */}
      <View style={styles.featuresSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>View more →</Text>
          </TouchableOpacity>
        </View>

        {/* Premium Feature Card 1 */}
        <TouchableOpacity
          style={styles.premiumFeatureCard}
          onPress={() => navigation.navigate("JobList")}
          activeOpacity={0.85}
        >
          <View style={styles.featureCardGradient1} />
          <View style={styles.featureCardContent}>
            <View style={styles.featureCardHeader}>
              <View style={styles.featureCardIconBox1}>
                <Text style={styles.featureCardIcon}>📋</Text>
              </View>
              <Text style={styles.featureCardArrow}>→</Text>
            </View>
            <Text style={styles.featureCardTitle}>Browse Jobs</Text>
            <Text style={styles.featureCardDesc}>
              Explore thousands of opportunities nearby
            </Text>
            <View style={styles.featureCardBadge}>
              <Text style={styles.badgeLabel}>245+ Active</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Feature Cards Grid */}
        <View style={styles.featureCardsGrid}>
          {/* Card 2 */}
          <TouchableOpacity
            style={styles.miniFeatureCard}
            onPress={() => navigation.navigate("Map")}
            activeOpacity={0.85}
          >
            <View style={styles.miniCardGradient2} />
            <View style={styles.miniCardContent}>
              <Text style={styles.miniCardIcon}>🗺️</Text>
              <Text style={styles.miniCardTitle}>Map View</Text>
              <Text style={styles.miniCardDesc}>Find nearby</Text>
            </View>
          </TouchableOpacity>

          {/* Card 3 */}
          <TouchableOpacity
            style={styles.miniFeatureCard}
            onPress={() => navigation.navigate("PostJob")}
            activeOpacity={0.85}
          >
            <View style={styles.miniCardGradient3} />
            <View style={styles.miniCardContent}>
              <Text style={styles.miniCardIcon}>➕</Text>
              <Text style={styles.miniCardTitle}>Post Job</Text>
              <Text style={styles.miniCardDesc}>Hire workers</Text>
            </View>
          </TouchableOpacity>

          {/* Card 4 */}
          <TouchableOpacity
            style={styles.miniFeatureCard}
            onPress={() => navigation.navigate("JobStatus")}
            activeOpacity={0.85}
          >
            <View style={styles.miniCardGradient4} />
            <View style={styles.miniCardContent}>
              <Text style={styles.miniCardIcon}>✅</Text>
              <Text style={styles.miniCardTitle}>My Jobs</Text>
              <Text style={styles.miniCardDesc}>Track work</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ===== JOB CATEGORIES ===== */}
      <View style={styles.categoriesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Categories</Text>
        </View>
        <View style={styles.categoriesGrid}>
          <JobCategory icon="🏠" name="Cleaning" count="245" />
          <JobCategory icon="🍕" name="Delivery" count="189" />
          <JobCategory icon="🔧" name="Repair" count="156" />
          <JobCategory icon="📦" name="Moving" count="203" />
        </View>
      </View>

      {/* ===== TRENDING JOBS ===== */}
      <View style={styles.trendingSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Now 🔥</Text>
        </View>
        <TouchableOpacity style={styles.trendingCard} activeOpacity={0.7}>
          <View style={styles.trendingLeft}>
            <Text style={styles.trendingIcon}>🏢</Text>
            <View>
              <Text style={styles.trendingTitle}>Office Setup</Text>
              <Text style={styles.trendingMeta}>📍 2.5 km away • 2 hours</Text>
            </View>
          </View>
          <View style={styles.trendingRight}>
            <Text style={styles.trendingPrice}>$45</Text>
            <Text style={styles.trendingStatus}>Available</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.trendingCard} activeOpacity={0.7}>
          <View style={styles.trendingLeft}>
            <Text style={styles.trendingIcon}>🧹</Text>
            <View>
              <Text style={styles.trendingTitle}>Home Cleaning</Text>
              <Text style={styles.trendingMeta}>📍 1.8 km away • 3 hours</Text>
            </View>
          </View>
          <View style={styles.trendingRight}>
            <Text style={styles.trendingPrice}>$60</Text>
            <Text style={styles.trendingStatus}>Hot</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ===== WHY CHOOSE US ===== */}
      <View style={styles.premiumSection}>
        <View style={styles.premiumCard}>
          <Text style={styles.premiumTitle}>✨ Why Choose TempJobFinder?</Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text>📍</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Smart Location Matching</Text>
                <Text style={styles.featureDesc}>
                  Find jobs based on proximity
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text>⚡</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>1-Click Accept</Text>
                <Text style={styles.featureDesc}>Start earning instantly</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text>💰</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Transparent Pricing</Text>
                <Text style={styles.featureDesc}>
                  Know exactly what you earn
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text>🛡️</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Secure & Verified</Text>
                <Text style={styles.featureDesc}>
                  Safe payments & verified employers
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text>📱</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Real-time Updates</Text>
                <Text style={styles.featureDesc}>
                  Get notified about new opportunities
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text>🎯</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Performance Tracking</Text>
                <Text style={styles.featureDesc}>
                  Monitor earnings & ratings
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* ===== FOOTER CTA ===== */}
      <View style={styles.footerSection}>
        <View style={styles.footerCTA}>
          <Text style={styles.footerIcon}>🚀</Text>
          <Text style={styles.footerTitle}>Ready to earn more?</Text>
          <Text style={styles.footerDesc}>
            Browse thousands of jobs available today
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate("JobList")}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>Start Earning Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    paddingBottom: 40,
  },

  /* ===== HEADER ===== */
  headerGradient: {
    backgroundColor: "#667EEA",
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#667EEA",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  headerContent: {
    marginTop: 8,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  greeting: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  notificationBadge: {
    position: "relative",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationIcon: {
    fontSize: 28,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#667EEA",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "400",
    letterSpacing: 0.3,
  },

  /* ===== SEARCH BAR ===== */
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: -15,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: "#A0AEC0",
    fontWeight: "500",
  },
  filterIcon: {
    fontSize: 18,
    marginLeft: 10,
  },

  /* ===== QUICK STATS ===== */
  quickStatsSection: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  statItemContainer: {
    flex: 1,
    minWidth: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statItemIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statItemValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#667EEA",
    marginBottom: 4,
  },
  statItemLabel: {
    fontSize: 11,
    color: "#718096",
    fontWeight: "600",
    textAlign: "center",
  },

  /* ===== SECTION HEADER ===== */
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A202C",
    letterSpacing: 0.3,
  },
  seeAllText: {
    fontSize: 13,
    color: "#667EEA",
    fontWeight: "600",
  },

  /* ===== FEATURES SECTION ===== */
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  cardsGrid: {
    flexDirection: "row",
    gap: 14,
  },
  cardsColumn: {
    flex: 1,
    gap: 14,
  },

  /* Premium Feature Card */
  premiumFeatureCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 24,
    marginBottom: 14,
    backgroundColor: "#fff",
    shadowColor: "#667EEA",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  featureCardGradient1: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "#667EEA",
  },
  featureCardContent: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  featureCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    zIndex: 2,
  },
  featureCardIconBox1: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "rgba(102, 126, 234, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 0,
  },
  featureCardIcon: {
    fontSize: 32,
  },
  featureCardArrow: {
    fontSize: 24,
    color: "#667EEA",
    fontWeight: "700",
    marginTop: 4,
  },
  featureCardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A202C",
    marginBottom: 8,
    letterSpacing: -0.3,
    zIndex: 2,
  },
  featureCardDesc: {
    fontSize: 13,
    color: "#718096",
    fontWeight: "500",
    lineHeight: 19,
    marginBottom: 12,
    zIndex: 2,
  },
  featureCardBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#667EEA",
    zIndex: 2,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#667EEA",
  },

  /* Mini Feature Cards Grid */
  featureCardsGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  miniFeatureCard: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    borderRadius: 16,
    minHeight: 140,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  miniCardGradient2: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#F59E0B",
    opacity: 0.08,
  },
  miniCardGradient3: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#48BB78",
    opacity: 0.08,
  },
  miniCardGradient4: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#3B82F6",
    opacity: 0.08,
  },
  miniCardContent: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  miniCardIcon: {
    fontSize: 34,
    marginBottom: 10,
  },
  miniCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A202C",
    textAlign: "center",
    marginBottom: 6,
  },
  miniCardDesc: {
    fontSize: 11,
    color: "#A0AEC0",
    fontWeight: "500",
    textAlign: "center",
  },

  actionCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    justifyContent: "space-between",
    minHeight: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
  },
  cardContent: {
    alignItems: "center",
    flex: 1,
    justifyContent: "space-between",
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
    textAlign: "center",
  },
  cardDesc: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "500",
  },
  arrowContainer: {
    marginTop: 8,
  },
  arrow: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "600",
  },

  /* ===== CATEGORIES ===== */
  categoriesSection: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  categoryCard: {
    flex: 1,
    minWidth: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 4,
    textAlign: "center",
  },
  categoryCount: {
    fontSize: 12,
    color: "#718096",
    fontWeight: "600",
  },

  /* ===== TRENDING ===== */
  trendingSection: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  trendingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  trendingLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  trendingIcon: {
    fontSize: 32,
  },
  trendingTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 4,
  },
  trendingMeta: {
    fontSize: 12,
    color: "#718096",
    fontWeight: "500",
  },
  trendingRight: {
    alignItems: "flex-end",
  },
  trendingPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#48BB78",
    marginBottom: 4,
  },
  trendingStatus: {
    fontSize: 11,
    color: "#667EEA",
    fontWeight: "600",
    backgroundColor: "#F0E7FF",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },

  /* ===== PREMIUM SECTION ===== */
  premiumSection: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  premiumCard: {
    borderRadius: 20,
    padding: 22,
    backgroundColor: "#F7FAFC",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A202C",
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginTop: 2,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 3,
  },
  featureDesc: {
    fontSize: 12,
    color: "#718096",
    fontWeight: "500",
    lineHeight: 16,
  },

  /* ===== FOOTER ===== */
  footerSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  footerCTA: {
    backgroundColor: "#667EEA",
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
  },
  footerIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  footerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  footerDesc: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#667EEA",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});

export default HomeScreen;
