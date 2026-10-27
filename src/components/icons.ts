import type { SvgIconComponent } from "@mui/icons-material";
import AdminPanelSettingsOutlined from "@mui/icons-material/AdminPanelSettingsOutlined";
import ApiOutlined from "@mui/icons-material/ApiOutlined";
import AppsOutlined from "@mui/icons-material/AppsOutlined";
import ArticleOutlined from "@mui/icons-material/ArticleOutlined";
import AttachFileOutlined from "@mui/icons-material/AttachFileOutlined";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import AutorenewOutlined from "@mui/icons-material/AutorenewOutlined";
import BoltOutlined from "@mui/icons-material/BoltOutlined";
import BrushOutlined from "@mui/icons-material/BrushOutlined";
import BusinessCenterOutlined from "@mui/icons-material/BusinessCenterOutlined";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import CampaignOutlined from "@mui/icons-material/CampaignOutlined";
import CheckCircleOutlineOutlined from "@mui/icons-material/CheckCircleOutlineOutlined";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import CompareArrowsOutlined from "@mui/icons-material/CompareArrowsOutlined";
import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import EventOutlined from "@mui/icons-material/EventOutlined";
import FlagOutlined from "@mui/icons-material/FlagOutlined";
import FlashOnOutlined from "@mui/icons-material/FlashOnOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import HelpOutlineOutlined from "@mui/icons-material/HelpOutlineOutlined";
import HighlightOffOutlined from "@mui/icons-material/HighlightOffOutlined";
import InsertChartOutlined from "@mui/icons-material/InsertChartOutlined";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import InventoryOutlined from "@mui/icons-material/InventoryOutlined";
import LayersOutlined from "@mui/icons-material/LayersOutlined";
import LiveHelpOutlined from "@mui/icons-material/LiveHelpOutlined";
import LocalAtmOutlined from "@mui/icons-material/LocalAtmOutlined";
import LocalShippingOutlined from "@mui/icons-material/LocalShippingOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import MailOutlineOutlined from "@mui/icons-material/MailOutlineOutlined";
import MapOutlined from "@mui/icons-material/MapOutlined";
import MarkEmailReadOutlined from "@mui/icons-material/MarkEmailReadOutlined";
import NotificationsNoneOutlined from "@mui/icons-material/NotificationsNoneOutlined";
import PaletteOutlined from "@mui/icons-material/PaletteOutlined";
import PaymentsOutlined from "@mui/icons-material/PaymentsOutlined";
import PeopleOutlineOutlined from "@mui/icons-material/PeopleOutlineOutlined";
import PersonOutlineOutlined from "@mui/icons-material/PersonOutlineOutlined";
import PhoneIphoneOutlined from "@mui/icons-material/PhoneIphoneOutlined";
import PhotoLibraryOutlined from "@mui/icons-material/PhotoLibraryOutlined";
import PublicOutlined from "@mui/icons-material/PublicOutlined";
import QuizOutlined from "@mui/icons-material/QuizOutlined";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import RocketLaunchOutlined from "@mui/icons-material/RocketLaunchOutlined";
import ScheduleOutlined from "@mui/icons-material/ScheduleOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import SellOutlined from "@mui/icons-material/SellOutlined";
import ShieldOutlined from "@mui/icons-material/ShieldOutlined";
import SpeedOutlined from "@mui/icons-material/SpeedOutlined";
import StarOutlineOutlined from "@mui/icons-material/StarOutlineOutlined";
import StorageOutlined from "@mui/icons-material/StorageOutlined";
import StoreMallDirectoryOutlined from "@mui/icons-material/StoreMallDirectoryOutlined";
import StorefrontOutlined from "@mui/icons-material/StorefrontOutlined";
import TranslateOutlined from "@mui/icons-material/TranslateOutlined";
import TravelExploreOutlined from "@mui/icons-material/TravelExploreOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import type { IconKey } from "@/features/questionnaire/types";

export const OPTION_ICONS: Record<IconKey, SvgIconComponent> = {
  business: BusinessCenterOutlined,
  store: StorefrontOutlined,
  apps: AppsOutlined,
  rocket: RocketLaunchOutlined,
  refresh: AutorenewOutlined,
  help: HelpOutlineOutlined,
  check: CheckCircleOutlineOutlined,
  close: HighlightOffOutlined,
  question: QuizOutlined,
  language: TranslateOutlined,
  palette: PaletteOutlined,
  brush: BrushOutlined,
  auto: AutoAwesomeOutlined,
  upload: CloudUploadOutlined,
  schedule: ScheduleOutlined,
  bolt: BoltOutlined,
  flash: FlashOnOutlined,
  calendar: CalendarMonthOutlined,
  mail: MailOutlineOutlined,
  photo: PhotoLibraryOutlined,
  article: ArticleOutlined,
  star: StarOutlineOutlined,
  faq: LiveHelpOutlined,
  map: MapOutlined,
  newsletter: MarkEmailReadOutlined,
  search: SearchOutlined,
  seo: TravelExploreOutlined,
  payments: PaymentsOutlined,
  cash: LocalAtmOutlined,
  truck: LocalShippingOutlined,
  locker: Inventory2Outlined,
  pickup: StoreMallDirectoryOutlined,
  public: PublicOutlined,
  inventory: InventoryOutlined,
  receipt: ReceiptLongOutlined,
  group: GroupsOutlined,
  lock: LockOutlined,
  admin: AdminPanelSettingsOutlined,
  database: StorageOutlined,
  api: ApiOutlined,
  dashboard: DashboardOutlined,
  file: AttachFileOutlined,
  notifications: NotificationsNoneOutlined,
  chart: InsertChartOutlined,
  shield: ShieldOutlined,
  speed: SpeedOutlined,
  phone: PhoneIphoneOutlined,
  edit: EditOutlined,
  trend: TrendingUpOutlined,
  campaign: CampaignOutlined,
  event: EventOutlined,
  download: DownloadOutlined,
  ab: CompareArrowsOutlined,
  layers: LayersOutlined,
  person: PersonOutlineOutlined,
  people: PeopleOutlineOutlined,
  sell: SellOutlined,
  flag: FlagOutlined,
};
